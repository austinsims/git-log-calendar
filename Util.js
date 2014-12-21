function Util() {
    this.quote = function (s) {
        return '"' + s + '"';
    };

    this.replaceAll = function (haystack, needle, replacement) {
        // Convert to string so we can pass node Buffers
        return String(haystack).replace(new RegExp(needle, 'g'), replacement);
    }
}

module.exports = new Util();
