import * as assert from "assert";
import * as bemHelper from "../extension";

suite("Extension Tests", () => {
    test("CSS Class extraction - Camel Case", () => {
        const html = `
            <body>
                <div class="navBody">
                    <div class="navBody__listItem">One</div>
                    <div class="navBody__listItem">Two</div>
                    <div class="navBody__listItem--wide">Three</div>
                    <div class="navBody__listItem--wide">Four</div>
                </div>
                <div class="navFooter"></div>
            </body>
        `;
        const expected = [
            "navBody",
            "navBody__listItem",
            "navBody__listItem--wide",
            "navFooter"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Pascal Case", () => {
        const html = `
            <body>
                <div class="NavBody">
                    <div class="NavBody__ListItem">One</div>
                    <div class="NavBody__ListItem">Two</div>
                    <div class="NavBody__ListItem--Wide">Three</div>
                    <div class="NavBody__ListItem--Wide">Four</div>
                </div>
                <div class="NavFooter"></div>
            </body>
        `;
        const expected = [
            "NavBody",
            "NavBody__ListItem",
            "NavBody__ListItem--Wide",
            "NavFooter"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Snake Case", () => {
        const html = `
            <body>
                <div class="nav_body">
                    <div class="nav_body__list_item">One</div>
                    <div class="nav_body__list_item">Two</div>
                    <div class="nav_body__list_item--wide">Three</div>
                    <div class="nav_body__list_item--wide">Four</div>
                </div>
                <div class="nav_footer"></div>
            </body>
        `;
        const expected = [
            "nav_body",
            "nav_body__list_item",
            "nav_body__list_item--wide",
            "nav_footer"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Kebab Case", () => {
        const html = `
            <body>
                <div class="nav">
                    <div class="nav__item menu__item">One</div>
                    <div class="nav__item">Two</div>
                    <div class="nav__item menu__item">Three</div>
                    <div class="nav__item nav__item--four">Four</div>
                </div>
                <div class="nav-two">
                    <div class="nav-two__item">
                        <div class="nav-two__item"></div>
                        <div class="nav-two__item nav-two__item--two"></div>
                    </div>
                </div>
            </body>
        `;
        const expected = [
            "nav",
            "nav__item",
            "nav__item--four",
            "nav-two",
            "nav-two__item",
            "nav-two__item--two",
            "menu__item"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - Basic", () => {
        const html = `
            <body>
                <div class="nav">
                    <div class="nav__item">One</div>
                    <div class="nav__item">Two</div>
                    <div class="nav__item">Three</div>
                    <div class="nav__item">Four</div>
                </div>
                <div class="nav-two"></div>
            </body>
        `;
        const expected = ["nav", "nav__item", "nav-two"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - Single Quotes", () => {
        const html = `
            <body>
                <div class='nav'>
                    <div class='nav__item'>One</div>
                    <div class='nav__item'>Two</div>
                    <div class='nav__item'>Three</div>
                    <div class='nav__item'>Four</div>
                </div>
                <div class='nav-two'></div>
            </body>
        `;
        const expected = ["nav", "nav__item", "nav-two"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - No Classes", () => {
        const html = ``;
        const expected: string[] = [];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - React", () => {
        const html = `<div className="parent-class"><div className="parent-class__child"></div></div>`;
        const expected = ["parent-class", "parent-class__child"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Generation - Single Flat", () => {
        let actual = bemHelper.generateStyleSheet(["test-class"], true);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Flat", () => {
        let actual = bemHelper.generateStyleSheet(
            ["test-class", "test-class-two", "class-test"],
            true
        );
        let expected = ".class-test{}.test-class{}.test-class-two{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Single Nested", () => {
        let actual = bemHelper.generateStyleSheet(["test-class"], false);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Nested", () => {
        let actual = bemHelper.generateStyleSheet(
            [
                "test-class",
                "class-test__element",
                "class-test",
                "class-test__element--one",
                "class-test__element--two"
            ],
            false
        );
        let expected = ".class-test{&__element{&--one{}&--two{}}}.test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Modified Blocks Nested", () => {
        let actual = bemHelper.generateStyleSheet(
            ["test-block", "test-block--mod", "test-block--mod-2"],
            false
        );
        let expected = ".test-block{&--mod{}&--mod-2{}}";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Kebab Case", () => {
        let html = `
            <div class="body-class">
                <div class="body-class__child-element"></div>
                <div class="body-class__another-child"></div>
                <div class="body-class__child-element body-class__child-element--modified"></div>
            </div>
            <div class="body-class-2">
                <div class="body-class-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "body-class-2";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Camel Case", () => {
        let html = `
            <div class="bodyClass">
                <div class="bodyClass__childElement"></div>
                <div class="bodyClass__anotherChild"></div>
                <div class="bodyClass__childElement bodyClass__childElement--modified"></div>
            </div>
            <div class="bodyClass-2">
                <div class="bodyClass-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "bodyClass-2";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Pascal Case", () => {
        let html = `
            <div class="BodyClass">
                <div class="BodyClass__ChildElement"></div>
                <div class="BodyClass__AnotherChild"></div>
            </div>
            <div class="BodyClass-2">
                    <div class="BodyClass-2__Child-1"></div>
            `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "BodyClass-2";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Snake Case", () => {
        let html = `
            <div class="body_class">
                <div class="body_class__child_element"></div>
                <div class="body_class__another_child"></div>
                <div
                    class="body_class__child_element body_class__child_element--modified"
                ></div>
            </div>
            <div class="body_class_2">
                <div class="body_class_2__child_1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "body_class_2";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Kebab Case", () => {
        let html = `
            <div class="body-class">
                <div class="body-class__child-element"></div>
                <div class="body-class__another-child"></div>
                <div class="body-class__child-element body-class__child-element--modified"></div>
            </div>
            <div class="body-class-2">
                <div class="body-class-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "body-class-2__child-1";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Camel Case", () => {
        let html = `
            <div class="bodyClass">
                <div class="bodyClass__childElement"></div>
                <div class="bodyClass__anotherChild"></div>
                <div class="bodyClass__childElement bodyClass__childElement--modified"></div>
            </div>
            <div class="bodyClass-2">
                <div class="bodyClass-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "bodyClass-2__child-1";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Pascal Case", () => {
        let html = `
            <div class="BodyClass">
                <div class="BodyClass__ChildElement"></div>
                <div class="BodyClass__AnotherChild"></div>
            </div>
            <div class="BodyClass-2">
                    <div class="BodyClass-2__Child-1"></div>
            `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "BodyClass-2__Child-1";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Snake Case", () => {
        let html = `
            <div class="body_class">
                <div class="body_class__child_element"></div>
                <div class="body_class__another_child"></div>
                <div
                    class="body_class__child_element body_class__child_element--modified"
                ></div>
            </div>
            <div class="body_class_2">
                <div class="body_class_2__child_1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "body_class_2__child_1";
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Snake", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "test_class__test_child--modi_fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Pascal", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "TestClass__TestChild--ModiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Camel", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "testClass__testChild--modiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.CamelCase
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Kebab", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "test-class__test-child--modi-fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Pascal", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "TestClass__TestChild--ModiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Camel", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "testClass__testChild--modiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.CamelCase
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Kebab", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "test-class__test-child--modi-fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Snake", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "test_class__test_child--modi_fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Pascal", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "TestClass__TestChild--ModiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Kebab", () => {
        let inputClassName = "TestClass__TestChild--ModiFier";
        let expected = "test-class__test-child--modi-fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Camel", () => {
        let inputClassName = "TestClass__TestChild--ModiFier";
        let expected = "testClass__testChild--modiFier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.CamelCase
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Snake", () => {
        let inputClassName = "TestClass__testChild--modiFier";
        let expected = "test_class__test_child--modi_fier";
        let actual = bemHelper.convertClass(
            inputClassName,
            bemHelper.ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Class Name Case Matching", () => {
        let pascalClass = "PascalClass__Elem--ModIfier";
        let camelClass = "camelClass__elem--modIfier";
        let kebabClass = "kebab-class__elem--mod-ifier";
        let snakeClass = "snake_class__elem__mod_ifier";
        assert.equal(
            bemHelper.isCaseMatch(
                camelClass,
                bemHelper.ClassNameCases.CamelCase
            ),
            true
        );
        assert.equal(
            bemHelper.isCaseMatch(camelClass, bemHelper.ClassNameCases.Kebab),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(camelClass, bemHelper.ClassNameCases.Pascal),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(camelClass, bemHelper.ClassNameCases.Snake),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(
                kebabClass,
                bemHelper.ClassNameCases.CamelCase
            ),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(kebabClass, bemHelper.ClassNameCases.Kebab),
            true
        );
        assert.equal(
            bemHelper.isCaseMatch(kebabClass, bemHelper.ClassNameCases.Pascal),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(kebabClass, bemHelper.ClassNameCases.Snake),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(
                pascalClass,
                bemHelper.ClassNameCases.CamelCase
            ),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(pascalClass, bemHelper.ClassNameCases.Kebab),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(pascalClass, bemHelper.ClassNameCases.Pascal),
            true
        );
        assert.equal(
            bemHelper.isCaseMatch(pascalClass, bemHelper.ClassNameCases.Snake),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(
                snakeClass,
                bemHelper.ClassNameCases.CamelCase
            ),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(snakeClass, bemHelper.ClassNameCases.Kebab),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(snakeClass, bemHelper.ClassNameCases.Pascal),
            false
        );
        assert.equal(
            bemHelper.isCaseMatch(snakeClass, bemHelper.ClassNameCases.Snake),
            true
        );
    });
});
