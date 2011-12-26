var htmlProcessor = {
    sliceHTML: function (code) {
        var blocks = [],
            scriptMatcher = '<script .*type="(.*)".*>((:?[\n\r]|.)*?)<\/script>',
            scriptRegExp = new RegExp(scriptMatcher, "g"),
            position = 0,
            lastInsertedPosition = 0,
            positionInRemaining,
            match, text, language;

        while ((positionInRemaining = code.substr(lastInsertedPosition).search(scriptRegExp)) !== -1) {
            position = lastInsertedPosition + positionInRemaining;
            match = new RegExp(scriptMatcher).exec(code.substr(position));
            language = match[1];
            text = match[2];
            position += code.substr(position).indexOf(text);

            blocks.push({
                language: "html",
                text: code.substr(lastInsertedPosition, position-lastInsertedPosition)
            });
            blocks.push({
                language: language,
                text: text
            });

            lastInsertedPosition = position + text.length;
        }
        blocks.push({
            language: "html",
            text: code.substr(lastInsertedPosition)
        });

        return blocks;
    },
    processBlock: function (block) {
        function process (text, regexp) {
            var result = [],
                matches = text.match(new RegExp(regexp, "g")),
                lastPos = 0, comment = "";

            if (matches) {
                matches.forEach(function (match) {
                    var pos = text.indexOf(match),
                        code = text.substr(lastPos, pos-lastPos),
                        comment = new RegExp(regexp).exec(match)[1];
                    result.push({ text: code, type: "code" });
                    result.push({ text: comment, type: "comment" });
                    text = text.replace(match, "");
                    lastPos = pos;
                });
            }
            result.push({ text: text.substr(lastPos), type: "code" });
            return result;
        }

        switch (block.language) {
            case "html":
                return process(block.text, '<\\!--((:?[\n\r]|.)*?)-->');
                break;

            default:
                return process(block.text, '//(.*)');
                //return processOneLines(block.text, '([.;]*)\\s*\/\/(.*)');
                break;
        }
    },
    processComments: function (comments) {
        return [];
    }
};