"use strict";
var Strings = (function () {
    function Strings() {
    }
    Strings.Greeting = "Hello! In order to verify your Steam account, you need to send the" +
        " following code to %s:";
    Strings.CodeGrant = "Your code is: %s";
    Strings.Farewell = "Follow the instructions in %s to proceed. I will now unfriend you." +
        " If you send me a new friend request, I will grant you a different code.";
    return Strings;
}());
exports.Strings = Strings;
