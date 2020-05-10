import * as vscode from "vscode";
import { BemHelper, ClassNameCases } from "./BemHelper";
import { getConfigValue } from "./ez-vscode";

export class BemDiagnosticProvider {
    public diagnosticCollectionName = "BemHelper";
    public bemHelper: BemHelper = new BemHelper();
    public errors: vscode.Diagnostic[] = [];

    constructor() {
        let elementSeparator = getConfigValue(
            "bemHelper.elementSeparator",
            "__"
        );
        let modifierSeparator = getConfigValue(
            "bemHelper.modifierSeparator",
            "--"
        );

        this.bemHelper.elementSeparator = elementSeparator;
        this.bemHelper.modifierSeparator = modifierSeparator;
    }

    /*
     * Get a list of errors with class depth problems (e.g 'one__two__three')
     */
    public getClassNameDepthProblems(
        html: string,
        activeEditor: vscode.TextEditor
    ) {
        let errors: vscode.Diagnostic[] = [];

        let classes = this.bemHelper.getClasses(html);

        if (!classes) {
            return errors;
        }

        classes.forEach((className) => {
            if (!this.bemHelper.isBemClass(className)) {
                let i = -1;
                if (className === "") {
                    //Dont process empty class names as they can cause issues with indexOf
                    return;
                }
                while (
                    (i = html.indexOf(className, i + 1)) !== -1 &&
                    html.length >= i
                ) {
                    const startPos = activeEditor.document.positionAt(i);
                    const endPos = activeEditor.document.positionAt(
                        i + className.length
                    );
                    errors.push({
                        code: "depth",
                        message:
                            "BEM - classes must only consist of block and element.",
                        range: new vscode.Range(startPos, endPos),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: "bem helper",
                        relatedInformation: [
                            new vscode.DiagnosticRelatedInformation(
                                new vscode.Location(
                                    activeEditor.document.uri,
                                    new vscode.Range(
                                        new vscode.Position(
                                            startPos.line,
                                            startPos.character
                                        ),
                                        new vscode.Position(
                                            endPos.line,
                                            endPos.character
                                        )
                                    )
                                ),
                                `${className}`
                            ),
                        ],
                    });
                }
            }
        });

        return errors;
    }

    /*
     * Get a list of errors with class name cases
     */
    public getClassNameCaseProblems(
        html: string,
        activeEditor: vscode.TextEditor,
        casing: ClassNameCases,
        maxCount: number
    ) {
        let errors: vscode.Diagnostic[] = [];
        let classes = this.bemHelper.getClasses(html);

        if (!classes) {
            return errors;
        }

        classes.forEach((className) => {
            if (errors.length <= maxCount) {
                if (!this.bemHelper.isCaseMatch(className, casing)) {
                    let i = -1;
                    if (className === "") {
                        //Dont process empty class names as they can cause issues with indexOf
                        return;
                    }
                    while (
                        (i = html.indexOf(className, i + 1)) !== -1 &&
                        html.length >= i
                    ) {
                        const startPos = activeEditor.document.positionAt(i);
                        const endPos = activeEditor.document.positionAt(
                            i + className.length
                        );

                        // Check that the matched line is a class name definition
                        let lineRange = new vscode.Range(
                            new vscode.Position(startPos.line, 0),
                            new vscode.Position(startPos.line, 1000)
                        );

                        let lineText = activeEditor.document.getText(lineRange);

                        if (
                            !lineText.match(
                                this.bemHelper.classPropertyValueRegex
                            )
                        ) {
                            // Skip match if it is not a class name definition
                            continue;
                        }

                        errors.push({
                            code: "case",
                            message: `BEM - Class names must be in ${casing} case `,
                            range: new vscode.Range(startPos, endPos),
                            severity: vscode.DiagnosticSeverity.Warning,
                            source: "bem helper",
                            relatedInformation: [
                                new vscode.DiagnosticRelatedInformation(
                                    new vscode.Location(
                                        activeEditor.document.uri,
                                        new vscode.Range(
                                            new vscode.Position(
                                                startPos.line,
                                                startPos.character
                                            ),
                                            new vscode.Position(
                                                endPos.line,
                                                endPos.character
                                            )
                                        )
                                    ),
                                    `${className}`
                                ),
                            ],
                        });
                    }
                }
            }
        });

        return errors.slice(0, maxCount);
    }

    /*
     * Get all diagnostic errors in the current document
     * and draw them to the VScode window
     */
    public updateDiagnostics(
        document: vscode.TextDocument,
        collection: vscode.DiagnosticCollection
    ): void {
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor === undefined) {
            return;
        }

        let maxWarningCount = getConfigValue("bemHelper.maxWarningsCount", 100);

        const docText = document.getText();
        let editorHighlights = new Array();

        //Verify class name depth
        if (getConfigValue("bemHelper.showDepthWarnings", false)) {
            editorHighlights = editorHighlights.concat(
                this.getClassNameDepthProblems(docText, activeEditor)
            );
        }

        //Verify class name cases
        let acceptedClassNameCase = getConfigValue(
            "bemHelper.classNameCase",
            ClassNameCases.Any
        );

        if (acceptedClassNameCase !== ClassNameCases.Any) {
            editorHighlights = editorHighlights.concat(
                this.getClassNameCaseProblems(
                    docText,
                    activeEditor,
                    acceptedClassNameCase,
                    maxWarningCount
                )
            );
        }

        if (editorHighlights.length > 0) {
            collection.set(document.uri, editorHighlights);
        } else {
            collection.clear();
        }
        this.errors = editorHighlights;
    }
}
