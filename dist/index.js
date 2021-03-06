"use strict";
var en_1 = require("./str/en");
var sprintf = require("sprintf-js").sprintf;
(function (Trigger) {
    Trigger[Trigger["FriendRequest"] = 1] = "FriendRequest";
    Trigger[Trigger["Manual"] = 2] = "Manual";
})(exports.Trigger || (exports.Trigger = {}));
var Trigger = exports.Trigger;
var Verificator = (function () {
    function Verificator(options) {
        this.pendingVerifications = [];
        this.steamClient = options.steamClient;
        this.steamUser = options.steamUser;
        this.steamFriends = options.steamFriends;
        this.codeLength = options.codeLength || 10;
        this.ignoredUsers = options.triggerOptions.ignoredUsers || [];
        this.secondService = options.triggerOptions.secondService || "";
        switch (options.trigger) {
            case Trigger.FriendRequest:
                this.initFriendRequestTrigger();
                break;
        }
    }
    /**
     * Verifies the validity of a code.
     * Returns the user's Steam ID if it's valid, or null if it isn't.
     * @param code The issued code.
     * @return {string|null} The user's steam ID or null.
     */
    Verificator.prototype.verify = function (code) {
        var i = this.pendingVerifications.map(function (e) { return e.code; }).indexOf(code);
        if (i !== -1) {
            var user = this.pendingVerifications[i].user;
            this.pendingVerifications.splice(i, 1);
            return user;
        }
        else {
            return null;
        }
    };
    Verificator.prototype.trigger = function (user) {
        var code = this.generateCode();
        // Delete previous pendingVerification, if it exists.
        // This happens if the user requested a code but never sent it back.
        var i = this.pendingVerifications.map(function (e) { return e.user; }).indexOf(user);
        if (i !== -1) {
            this.pendingVerifications.splice(i, 1);
        }
        this.pendingVerifications.push({
            user: user,
            code: code
        });
        return code;
    };
    Verificator.prototype.initFriendRequestTrigger = function () {
        var _this = this;
        this.steamFriends.on("friend", function (userID, EFriendRelationship) {
            if (EFriendRelationship === 2) {
                // Got a friend request, accept it if the user is not ignored
                if (_this.ignoredUsers.indexOf(userID) === -1) {
                    _this.steamFriends.addFriend(userID);
                    console.log("[STEAM] Added user " + userID + " to friends");
                    var code = _this.trigger(userID);
                    _this.steamFriends.sendMessage(userID, sprintf(en_1.Strings.Greeting, _this.secondService));
                    _this.steamFriends.sendMessage(userID, sprintf(en_1.Strings.CodeGrant, code));
                    _this.steamFriends.sendMessage(userID, sprintf(en_1.Strings.Farewell, _this.secondService));
                    console.log("[STEAM] Sent the code " + code + " to " + userID);
                    setTimeout(function () {
                        _this.steamFriends.removeFriend(userID);
                        console.log("[STEAM] Removed user " + userID + " from friends");
                    }, 10000);
                }
                else {
                    console.log("[STEAM] Got a friend request from " + userID +
                        ", but they are ignored.");
                    _this.steamFriends.removeFriend(userID);
                }
            }
        });
    };
    Verificator.prototype.generateCode = function () {
        var code = "";
        // Omitted characters that can look like others
        var possibleChars = ["B", "D", "E", "F", "G", "H", "C", "J", "K", "L", "M", "N", "P", "Q",
            "R", "S", "T", "W", "X", "Y", "Z", "2", "3", "5", "6", "7", "8", "9"];
        for (var i = 0; i < this.codeLength; i++) {
            code += possibleChars[Math.floor(Math.random() * possibleChars.length)];
        }
        return code;
    };
    return Verificator;
}());
exports.Verificator = Verificator;
