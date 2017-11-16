// ==UserScript==
// @name         Advanced Flagging
// @namespace    https://github.com/SOBotics
// @version      0.1
// @author       Robert Rudman
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @exclude      *://chat.stackexchange.com/*
// @exclude      *://chat.meta.stackexchange.com/*
// @exclude      *://chat.stackoverflow.com/*
// @exclude      *://blog.stackoverflow.com/*
// @exclude      *://*.area51.stackexchange.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.4/require.min.js
// @require      https://cdn.rawgit.com/ofirdagan/cross-domain-local-storage/d779a81a6383475a1bf88595a98b10a8bd5bb4ae/dist/scripts/xdLocalStorage.min.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("libs/Caching", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var xdLocalStorageInitializedResolver = function () { };
    var xdLocalStorageInitialized = new Promise(function (resolve, reject) { return xdLocalStorageInitializedResolver = resolve; });
    function InitializeCache(iframeUrl) {
        xdLocalStorage.init({
            iframeUrl: iframeUrl,
            initCallback: function () {
                xdLocalStorageInitializedResolver();
            }
        });
    }
    exports.InitializeCache = InitializeCache;
    function GetAndCache(cacheKey, getterPromise, expiresAt) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedItem, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GetFromCache(cacheKey)];
                    case 1:
                        cachedItem = _a.sent();
                        if (cachedItem !== undefined) {
                            return [2 /*return*/, cachedItem];
                        }
                        return [4 /*yield*/, getterPromise()];
                    case 2:
                        result = _a.sent();
                        StoreInCache(cacheKey, result, expiresAt);
                        return [2 /*return*/, result];
                }
            });
        });
    }
    exports.GetAndCache = GetAndCache;
    function ClearCache() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, xdLocalStorageInitialized];
                    case 1:
                        _a.sent();
                        xdLocalStorage.clear();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.ClearCache = ClearCache;
    function GetFromCache(cacheKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, xdLocalStorageInitialized];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                xdLocalStorageInitialized.then(function () {
                                    xdLocalStorage.getItem(cacheKey, function (data) {
                                        var actualItem = JSON.parse(data.value);
                                        if (!actualItem || (actualItem.Expires && actualItem.Expires < new Date())) {
                                            // It doesn't exist or is expired, so return nothing
                                            resolve();
                                            return;
                                        }
                                        return resolve(actualItem.Data);
                                    });
                                });
                            })];
                }
            });
        });
    }
    exports.GetFromCache = GetFromCache;
    function StoreInCache(cacheKey, item, expiresAt) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonStr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, xdLocalStorageInitialized];
                    case 1:
                        _a.sent();
                        jsonStr = JSON.stringify({ Expires: expiresAt, Data: item });
                        xdLocalStorage.setItem(cacheKey, jsonStr);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.StoreInCache = StoreInCache;
});
define("libs/FunctionUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Delay(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, milliseconds);
        });
    }
    exports.Delay = Delay;
    function GroupBy(collection, propertyGetter) {
        return collection.reduce(function (previousValue, currentItem) {
            (previousValue[propertyGetter(currentItem)] = previousValue[propertyGetter(currentItem)] || []).push(currentItem);
            return previousValue;
        }, {});
    }
    exports.GroupBy = GroupBy;
    ;
    function GetMembers(item) {
        var members = [];
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                members.push(key);
            }
        }
        return members;
    }
    exports.GetMembers = GetMembers;
});
define("libs/MetaSmokeyAPI", ["require", "exports", "libs/Caching", "libs/FunctionUtils"], function (require, exports, Caching_1, FunctionUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MetaSmokeDisabledConfig = 'MetaSmoke.Disabled';
    var MetaSmokeUserKeyConfig = 'MetaSmoke.UserKey';
    var MetaSmokeWasReportedConfig = 'MetaSmoke.WasReported';
    var MetaSmokeyAPI = /** @class */ (function () {
        function MetaSmokeyAPI(appKey, codeGetter) {
            var _this = this;
            if (!codeGetter) {
                codeGetter = function (metaSmokeOAuthUrl) { return __awaiter(_this, void 0, void 0, function () {
                    var isDisabled, cachedUserKey, returnCode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.IsDisabled()];
                            case 1:
                                isDisabled = _a.sent();
                                if (isDisabled) {
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, Caching_1.GetFromCache(MetaSmokeUserKeyConfig)];
                            case 2:
                                cachedUserKey = _a.sent();
                                if (cachedUserKey) {
                                    return [2 /*return*/, cachedUserKey];
                                }
                                if (!confirm('Setting up MetaSmoke... If you do not wish to connect, press cancel. This will not show again if you press cancel. To reset configuration, see footer of Stack Overflow.')) {
                                    Caching_1.StoreInCache(MetaSmokeDisabledConfig, true);
                                    return [2 /*return*/];
                                }
                                window.open(metaSmokeOAuthUrl, '_blank');
                                return [4 /*yield*/, FunctionUtils_1.Delay(100)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        var handleFDSCCode = function () {
                                            $(window).off('focus', handleFDSCCode);
                                            var code = window.prompt('Once you\'ve authenticated FDSC with metasmoke, you\'ll be given a code; enter it here.');
                                            if (!code) {
                                                resolve();
                                            }
                                            else {
                                                return resolve(code);
                                            }
                                        };
                                        $(window).focus(handleFDSCCode);
                                    })];
                            case 4:
                                returnCode = _a.sent();
                                return [2 /*return*/, returnCode];
                        }
                    });
                }); };
            }
            this.codeGetter = codeGetter;
            this.appKey = appKey;
            this.getUserKey(); // Make sure we request it immediately
        }
        MetaSmokeyAPI.prototype.getUserKey = function () {
            var _this = this;
            return Caching_1.GetAndCache(MetaSmokeUserKeyConfig, function () { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var prom, code;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prom = this.actualPromise;
                            if (prom === undefined) {
                                prom = this.codeGetter("https://metasmoke.erwaysoftware.com/oauth/request?key=" + this.appKey);
                                this.actualPromise = prom;
                            }
                            return [4 /*yield*/, prom];
                        case 1:
                            code = _a.sent();
                            $.ajax({
                                url: 'https://metasmoke.erwaysoftware.com/oauth/token?key=' + this.appKey + '&code=' + code,
                                method: 'GET'
                            }).done(function (data) { return resolve(data.token); })
                                .fail(function (err) { return reject(err); });
                            return [2 /*return*/];
                    }
                });
            }); }); });
        };
        MetaSmokeyAPI.prototype.Reset = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Caching_1.StoreInCache(MetaSmokeDisabledConfig, undefined)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, Caching_1.StoreInCache(MetaSmokeUserKeyConfig, undefined)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        MetaSmokeyAPI.prototype.IsDisabled = function () {
            return __awaiter(this, void 0, void 0, function () {
                var cachedDisabled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Caching_1.GetFromCache(MetaSmokeDisabledConfig)];
                        case 1:
                            cachedDisabled = _a.sent();
                            if (cachedDisabled === undefined) {
                                return [2 /*return*/, false];
                            }
                            return [2 /*return*/, cachedDisabled];
                    }
                });
            });
        };
        MetaSmokeyAPI.prototype.GetFeedback = function (postId, postType) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var urlStr, isDisabled, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            urlStr = postType === 'Answer'
                                ? "//" + window.location.hostname + "/a/" + postId
                                : "//" + window.location.hostname + "/questions/" + postId;
                            return [4 /*yield*/, this.IsDisabled()];
                        case 1:
                            isDisabled = _a.sent();
                            if (isDisabled) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, Caching_1.GetAndCache(MetaSmokeWasReportedConfig + "." + urlStr, function () { return new Promise(function (resolve, reject) {
                                    $.ajax({
                                        type: 'GET',
                                        url: 'https://metasmoke.erwaysoftware.com/api/posts/urls',
                                        data: {
                                            urls: urlStr,
                                            key: "" + _this.appKey
                                        }
                                    }).done(function (metaSmokeResult) {
                                        resolve(metaSmokeResult.items);
                                    }).fail(function (error) {
                                        reject(error);
                                    });
                                }); })];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        MetaSmokeyAPI.prototype.Report = function (postId, postType) {
            var _this = this;
            var urlStr = postType === 'Answer'
                ? "//" + window.location.hostname + "/a/" + postId
                : "//" + window.location.hostname + "/q/" + postId;
            var promise = new Promise(function (resolve, reject) {
                _this.getUserKey().then(function (userKey) {
                    $.ajax({
                        type: 'POST',
                        url: 'https://metasmoke.erwaysoftware.com/api/w/post/report',
                        data: {
                            post_link: urlStr,
                            key: _this.appKey,
                            token: userKey
                        }
                    }).done(function () { return resolve(); })
                        .fail(function () { return reject(); });
                });
            });
            promise.then(function () {
                Caching_1.StoreInCache(MetaSmokeWasReportedConfig + "." + urlStr, undefined);
            });
            return promise;
        };
        MetaSmokeyAPI.prototype.ReportTruePositive = function (metaSmokeId) {
            return this.SendFeedback(metaSmokeId, 'tpu-');
        };
        MetaSmokeyAPI.prototype.ReportFalsePositive = function (metaSmokeId) {
            return this.SendFeedback(metaSmokeId, 'fp-');
        };
        MetaSmokeyAPI.prototype.ReportNAA = function (metaSmokeId) {
            return this.SendFeedback(metaSmokeId, 'naa-');
        };
        MetaSmokeyAPI.prototype.SendFeedback = function (metaSmokeId, feedbackType) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.getUserKey().then(function (userKey) {
                    $.ajax({
                        type: 'POST',
                        url: 'https://metasmoke.erwaysoftware.com/api/w/post/' + metaSmokeId + '/feedback',
                        data: {
                            type: feedbackType,
                            key: _this.appKey,
                            token: userKey
                        }
                    }).done(function () { return resolve(); })
                        .fail(function () { return reject(); });
                });
            });
        };
        return MetaSmokeyAPI;
    }());
    exports.MetaSmokeyAPI = MetaSmokeyAPI;
});
define("FlagTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flagCategories = [
        {
            BoxStyle: { 'padding-left': '5px', 'padding-right': '5px', 'background-color': 'rgba(241, 148, 148, 0.6)' },
            AppliesTo: ['Answer', 'Question'],
            FlagTypes: [
                {
                    DisplayName: 'Spam',
                    ReportType: 'PostSpam'
                },
                {
                    DisplayName: 'Rude or Abusive',
                    ReportType: 'PostOffensive'
                }
            ]
        },
        {
            BoxStyle: { 'padding-left': '5px', 'padding-right': '5px' },
            AppliesTo: ['Answer'],
            FlagTypes: [
                {
                    DisplayName: 'Link Only',
                    ReportType: 'AnswerNotAnAnswer',
                    Comment: 'A link to a solution is welcome, but please ensure your answer is useful without it: ' +
                        '[add context around the link](//meta.stackexchange.com/a/8259) so your fellow users will ' +
                        'have some idea what it is and why it’s there, then quote the most relevant part of the ' +
                        'page you\'re linking to in case the target page is unavailable. ' +
                        '[Answers that are little more than a link may be deleted.](//stackoverflow.com/help/deleted-answers)'
                },
                {
                    DisplayName: 'Not an answer',
                    ReportType: 'AnswerNotAnAnswer',
                    Comments: [
                        {
                            ReputationLimit: 0,
                            Comment: 'This does not provide an answer to the question. You can [search for similar questions](//stackoverflow.com/search), ' +
                                'or refer to the related and linked questions on the right-hand side of the page to find an answer. ' +
                                'If you have a related but different question, [ask a new question](//stackoverflow.com/questions/ask), ' +
                                'and include a link to this one to help provide context. ' +
                                'See: [Ask questions, get answers, no distractions](//stackoverflow.com/tour)',
                        },
                        {
                            ReputationLimit: 50,
                            Comment: 'This post doesn\'t look like an attempt to answer this question. Every post here is expected to be ' +
                                'an explicit attempt to *answer* this question; if you have a critique or need a clarification of ' +
                                'the question or another answer, you can [post a comment](//stackoverflow.com/help/privileges/comment) ' +
                                '(like this one) directly below it. Please remove this answer and create either a comment or a new question. ' +
                                'See: [Ask questions, get answers, no distractions](//stackoverflow.com/tour)',
                        }
                    ]
                },
                {
                    DisplayName: 'Thanks',
                    ReportType: 'AnswerNotAnAnswer',
                    Comment: 'Please don\'t add _"thanks"_ as answers. They don\'t actually provide an answer to the question, ' +
                        'and can be perceived as noise by its future visitors. Once you [earn](http://meta.stackoverflow.com/q/146472) ' +
                        'enough [reputation](http://stackoverflow.com/help/whats-reputation), you will gain privileges to ' +
                        '[upvote answers](http://stackoverflow.com/help/privileges/vote-up) you like. This way future visitors of the question ' +
                        'will see a higher vote count on that answer, and the answerer will also be rewarded with reputation points. ' +
                        'See [Why is voting important](http://stackoverflow.com/help/why-vote).',
                },
                {
                    DisplayName: 'Me too',
                    ReportType: 'AnswerNotAnAnswer',
                    Comment: 'Please don\'t add *"Me too"* as answers. It doesn\'t actually provide an answer to the question. ' +
                        'If you have a different but related question, then [ask](//$SITEURL$/questions/ask) it ' +
                        '(reference this one if it will help provide context). If you\'re interested in this specific question, ' +
                        'you can [upvote](//stackoverflow.com/help/privileges/vote-up) it, leave a [comment](//stackoverflow.com/help/privileges/comment), ' +
                        'or start a [bounty](//stackoverflow.com/help/privileges/set-bounties) ' +
                        'once you have enough [reputation](//stackoverflow.com/help/whats-reputation).',
                },
                {
                    DisplayName: 'Library',
                    ReportType: 'AnswerNotAnAnswer',
                    Comment: 'Please don\'t just post some tool or library as an answer. At least demonstrate [how it solves the problem](http://meta.stackoverflow.com/a/251605) in the answer itself.'
                },
                {
                    DisplayName: 'Comment',
                    ReportType: 'AnswerNotAnAnswer',
                    Comment: 'This does not provide an answer to the question. Once you have sufficient [reputation](https://stackoverflow.com/help/whats-reputation) you will be able to [comment on any post](https://stackoverflow.com/help/privileges/comment); instead, [provide answers that don\'t require clarification from the asker](https://meta.stackexchange.com/questions/214173/why-do-i-need-50-reputation-to-comment-what-can-i-do-instead).'
                }
            ]
        },
        {
            BoxStyle: { 'padding-left': '5px', 'padding-right': '5px' },
            AppliesTo: ['Answer', 'Question'],
            FlagTypes: [
                {
                    DisplayName: 'Looks Fine',
                    ReportType: 'NoFlag'
                },
                {
                    DisplayName: 'Needs Editing',
                    ReportType: 'NoFlag'
                }
            ]
        }
    ];
});
define("libs/ChatApi", ["require", "exports", "libs/Caching"], function (require, exports, Caching_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChatApi = /** @class */ (function () {
        function ChatApi(chatUrl) {
            if (chatUrl === void 0) { chatUrl = 'http://chat.stackoverflow.com'; }
            this.chatRoomUrl = "" + chatUrl;
        }
        ChatApi.prototype.GetChannelFKey = function (roomId) {
            var _this = this;
            var cachingKey = "StackExchange.ChatApi.FKey_" + roomId;
            var getterPromise = new Promise(function (resolve, reject) {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: _this.chatRoomUrl + "/rooms/" + roomId,
                    onload: function (response) {
                        var fkey = response.responseText.match(/hidden" value="([\dabcdef]{32})/)[1];
                        resolve(fkey);
                    },
                    onerror: function (data) { return reject(data); }
                });
            });
            var expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            return Caching_2.GetAndCache(cachingKey, function () { return getterPromise; }, expiryDate);
        };
        ChatApi.prototype.SendMessage = function (roomId, message, providedFkey) {
            var _this = this;
            var fkeyPromise;
            if (!providedFkey) {
                fkeyPromise = this.GetChannelFKey(roomId);
            }
            else {
                fkeyPromise = Promise.resolve(providedFkey);
            }
            return fkeyPromise.then(function (fKey) {
                return new Promise(function (resolve, reject) {
                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: _this.chatRoomUrl + "/chats/" + roomId + "/messages/new",
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: 'text=' + encodeURIComponent(message) + '&fkey=' + fKey,
                        onload: function () { return resolve(); },
                        onerror: function (response) {
                            reject(response);
                        },
                    });
                });
            });
        };
        return ChatApi;
    }());
    exports.ChatApi = ChatApi;
});
define("libs/NattyApi", ["require", "exports", "libs/Caching", "libs/ChatApi"], function (require, exports, Caching_3, ChatApi_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nattyFeedbackUrl = 'http://samserver.bhargavrao.com:8000/napi/api/feedback';
    var NattyAPI = /** @class */ (function () {
        function NattyAPI() {
            this.chat = new ChatApi_1.ChatApi();
        }
        NattyAPI.prototype.WasReported = function (answerId) {
            return Caching_3.GetAndCache("NattyApi.Feedback." + answerId, function () { return new Promise(function (resolve, reject) {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: nattyFeedbackUrl + "/" + answerId,
                    onload: function (response) {
                        var nattyResult = JSON.parse(response.responseText);
                        if (nattyResult.items && nattyResult.items[0]) {
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    },
                    onerror: function (response) {
                        reject(response);
                    },
                });
            }); });
        };
        NattyAPI.prototype.Report = function (answerId) {
            var promise = this.chat.SendMessage(111347, "@Natty report http://stackoverflow.com/a/" + answerId);
            promise.then(function () {
                Caching_3.StoreInCache("NattyApi.Feedback." + answerId, undefined);
            });
            return promise;
        };
        NattyAPI.prototype.ReportTruePositive = function (answerId) {
            return this.chat.SendMessage(111347, "@Natty feedback http://stackoverflow.com/a/" + answerId + " tp");
        };
        NattyAPI.prototype.ReportNeedsEditing = function (answerId) {
            return this.chat.SendMessage(111347, "@Natty feedback http://stackoverflow.com/a/" + answerId + " ne");
        };
        NattyAPI.prototype.ReportFalsePositive = function (answerId) {
            return this.chat.SendMessage(111347, "@Natty feedback http://stackoverflow.com/a/" + answerId + " fp");
        };
        return NattyAPI;
    }());
    exports.NattyAPI = NattyAPI;
});
define("libs/StackExchangeWeb/StackExchangeOptions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("libs/StackExchangeWeb/StackExchangeWebParser", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isNatoPage() {
        return !!window.location.href.match(/\/new-answers-old-questions$/);
    }
    exports.isNatoPage = isNatoPage;
    function parseNatoPage() {
        var nodes = $('.answer-hyperlink').parent().parent();
        var results = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = $(nodes[i]);
            var postId = parseInt(node.find('.answer-hyperlink').attr('href').split('#')[1], 10);
            var answerTime = parseActionDate(node.find('.user-action-time'));
            var questionTime = parseActionDate(node.find('td .relativetime'));
            var authorReputation = parseReputation(node.find('.reputation-score'));
            var _a = parseAuthorDetails(node.find('.user-details')), authorName = _a.authorName, authorId = _a.authorId;
            results.push({
                type: 'Answer',
                element: node,
                postId: postId,
                answerTime: answerTime,
                questionTime: questionTime,
                authorReputation: authorReputation,
                authorName: authorName,
                authorId: authorId,
            });
        }
        return results;
    }
    exports.parseNatoPage = parseNatoPage;
    function isQuestionPage() {
        return !!window.location.href.match(/\/questions\/\d+\/.*/);
    }
    exports.isQuestionPage = isQuestionPage;
    function parseQuestionPage() {
        var questionNode = $('.question');
        var postId = parseInt(questionNode.attr('data-questionid'), 10);
        function getPostDetails(node) {
            var score = parseInt(node.find('.vote-count-post').text(), 10);
            var authorReputation = parseReputation(node.find('.post-signature .reputation-score').last());
            var _a = parseAuthorDetails(node.find('.post-signature .user-details').last()), authorName = _a.authorName, authorId = _a.authorId;
            var postTime = parseActionDate(node.find('.post-signature .relativetime').last());
            return { score: score, authorReputation: authorReputation, authorName: authorName, authorId: authorId, postTime: postTime };
        }
        var _a = getPostDetails(questionNode), score = _a.score, authorReputation = _a.authorReputation, authorName = _a.authorName, authorId = _a.authorId, postTime = _a.postTime;
        var results = [];
        var question = {
            type: 'Question',
            element: questionNode,
            postId: postId,
            postTime: postTime,
            score: score,
            authorReputation: authorReputation,
            authorName: authorName,
            authorId: authorId
        };
        results.push(question);
        var answerNodes = $('.answer');
        for (var i = 0; i < answerNodes.length; i++) {
            var answerNode = $(answerNodes[i]);
            var _b = getPostDetails(answerNode), score_1 = _b.score, authorReputation_1 = _b.authorReputation, authorName_1 = _b.authorName, authorId_1 = _b.authorId, postTime_1 = _b.postTime;
            results.push({
                type: 'Answer',
                element: questionNode,
                postId: postId,
                question: question,
                postTime: postTime_1,
                score: score_1,
                authorReputation: authorReputation_1,
                authorName: authorName_1,
                authorId: authorId_1
            });
        }
        return results;
    }
    exports.parseQuestionPage = parseQuestionPage;
    function isFlagsPage() {
        return !!window.location.href.match(/\/users\/flag-summary\//);
    }
    exports.isFlagsPage = isFlagsPage;
    function parseFlagsPage() {
        var nodes = $('.flagged-post');
        var results = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = $(nodes[i]);
            var type = node.find('.answer-hyperlink').length
                ? 'Answer'
                : 'Question';
            var postId = parseInt(type === 'Answer'
                ? node.find('.answer-hyperlink').attr('href').split('#')[1]
                : node.find('.question-hyperlink').attr('href').split('/')[2], 10);
            var score = parseInt(node.find('.answer-votes').text(), 10);
            var _a = parseAuthorDetails(node.find('.post-user-info')), authorName = _a.authorName, authorId = _a.authorId;
            var postTime = parseActionDate(node.find('.post-user-info .relativetime'));
            var handledTime = parseActionDate(node.find('.mod-flag .relativetime'));
            var fullHandledResult = node.find('.flag-outcome').text().trim().split(' - ');
            var handledResult = fullHandledResult[0].trim();
            var handledComment = fullHandledResult.slice(1).join(' - ').trim();
            results.push({
                type: type,
                postId: postId,
                score: score,
                postTime: postTime,
                handledTime: handledTime,
                handledResult: handledResult,
                handledComment: handledComment,
                authorName: authorName,
                authorId: authorId
            });
        }
        return results;
    }
    exports.parseFlagsPage = parseFlagsPage;
    function parseGenericPage() {
        var questionNodes = $('.question-hyperlink');
        var results = [];
        for (var i = 0; i < questionNodes.length; i++) {
            var questionNode = $(questionNodes[i]);
            var fragment = questionNode.attr('href').split('/')[2];
            if (fragment.indexOf('_') >= 0) {
                fragment = fragment.split('_')[1];
            }
            var postId = parseInt(fragment, 10);
            results.push({
                type: 'Question',
                element: questionNode,
                postId: postId
            });
        }
        var answerNodes = $('.answer-hyperlink');
        for (var i = 0; i < answerNodes.length; i++) {
            var answerNode = $(answerNodes[i]);
            var fragment = answerNode.attr('href').split('#')[1];
            if (fragment.indexOf('_') >= 0) {
                fragment = fragment.split('_')[1];
            }
            var postId = parseInt(fragment, 10);
            results.push({
                type: 'Answer',
                element: answerNode,
                postId: postId
            });
        }
        return results;
    }
    exports.parseGenericPage = parseGenericPage;
    function parseCurrentPage() {
        if (isNatoPage())
            // We explicitly type the page, as it allows the typescript compiler to 
            // figure out the type of posts if a user checks if. For example:
            // const parsed = parseCurrentPage();
            // if (parsed.Page === 'Nato') {
            //     parsed.Posts is now properly typed as a nato post
            // }
            // If we don't do this, 'Page' is simply a string and doesn't give us any compiler hints
            return { Page: 'NATO', Posts: parseNatoPage() };
        if (isQuestionPage())
            return { Page: 'Question', Posts: parseQuestionPage() };
        if (isFlagsPage())
            return { Page: 'Flags', Posts: parseFlagsPage() };
        return { Page: 'Unknown', Posts: parseGenericPage() };
    }
    exports.parseCurrentPage = parseCurrentPage;
    function parseReputation(reputationDiv) {
        var reputationText = reputationDiv.text();
        if (reputationText.indexOf('k') !== -1) {
            reputationText = reputationDiv.attr('title').substr('reputation score '.length);
        }
        reputationText = reputationText.replace(',', '');
        if (reputationText.trim() !== '')
            return parseInt(reputationText, 10);
        return undefined;
    }
    function parseAuthorDetails(authorDiv) {
        var userLink = authorDiv.find('a');
        var authorName = userLink.text();
        var userLinkRef = userLink.attr('href');
        var authorId;
        // Users can be deleted, and thus have no link to their profile.
        if (userLinkRef) {
            authorId = parseInt(userLinkRef.split('/')[2], 10);
        }
        return { authorName: authorName, authorId: authorId };
    }
    function parseActionDate(actionDiv) {
        if (!actionDiv.hasClass('relativetime')) {
            actionDiv = actionDiv.find('.relativetime');
        }
        var answerTime = new Date(actionDiv.attr('title'));
        return answerTime;
    }
});
define("AdvancedFlagging", ["require", "exports", "libs/MetaSmokeyAPI", "FlagTypes", "libs/NattyApi", "libs/Caching", "libs/FunctionUtils", "libs/StackExchangeWeb/StackExchangeWebParser"], function (require, exports, MetaSmokeyAPI_1, FlagTypes_1, NattyApi_1, Caching_4, FunctionUtils_2, StackExchangeWebParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable-next-line:no-debugger
    debugger;
    var metaSmokeKey = '0a946b9419b5842f99b052d19c956302aa6c6dd5a420b043b20072ad2efc29e0';
    function setupStyles() {
        var scriptNode = document.createElement('style');
        scriptNode.type = 'text/css';
        scriptNode.textContent = "\n#snackbar {\n    visibility: hidden;\n    min-width: 250px;\n    margin-left: -125px;\n    background-color: #00690c;\n    color: #fff;\n    text-align: center;\n    border-radius: 2px;\n    padding: 16px;\n    position: fixed;\n    z-index: 2000;\n    left: 50%;\n    top: 30px;\n    font-size: 17px;\n}\n\n#snackbar.show {\n    visibility: visible;\n    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;\n    animation: fadein 0.5s, fadeout 0.5s 2.5s;\n}\n\n@-webkit-keyframes fadein {\n    from {top: 0; opacity: 0;}\n    to {top: 30px; opacity: 1;}\n}\n\n@keyframes fadein {\n    from {top: 0; opacity: 0;}\n    to {top: 30px; opacity: 1;}\n}\n\n@-webkit-keyframes fadeout {\n    from {top: 30px; opacity: 1;}\n    to {top: 0; opacity: 0;}\n}\n\n@keyframes fadeout {\n    from {top: 30px; opacity: 1;}\n    to {top: 0; opacity: 0;}\n}";
        var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;
        target.appendChild(scriptNode);
    }
    ;
    function handleFlagAndComment(postId, flag, commentRequired, userReputation) {
        var result = {};
        if (commentRequired) {
            var commentText_1 = null;
            if (flag.Comment) {
                commentText_1 = flag.Comment;
            }
            else if (flag.Comments) {
                var comments = flag.Comments;
                comments.sort(function (a, b) { return b.ReputationLimit - a.ReputationLimit; });
                for (var i = 0; i < comments.length; i++) {
                    if (comments[i].ReputationLimit <= userReputation) {
                        commentText_1 = comments[i].Comment;
                        break;
                    }
                }
            }
            if (commentText_1) {
                result.CommentPromise = new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "//stackoverflow.com/posts/" + postId + "/comments",
                        type: 'POST',
                        data: { 'fkey': StackExchangeGlobal.options.user.fkey, 'comment': commentText_1 }
                    }).done(function (data) {
                        resolve(data);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        reject({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
                    });
                });
            }
        }
        if (flag.ReportType !== 'NoFlag') {
            result.FlagPromise = new Promise(function (resolve, reject) {
                $.ajax({
                    url: "//" + window.location.hostname + "/flags/posts/" + postId + "/add/" + flag.ReportType,
                    type: 'POST',
                    data: { 'fkey': StackExchangeGlobal.options.user.fkey, 'otherText': '' }
                }).done(function (data) {
                    resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    reject({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
                });
            });
        }
        result.PerformedActionPromise = Promise.resolve();
        return result;
    }
    var popup = $('<div>').attr('id', 'snackbar');
    var showingPromise = null;
    function displaySuccess(message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!showingPromise) return [3 /*break*/, 2];
                        showingPromise = FunctionUtils_2.Delay(3500);
                        popup.text(message);
                        popup.addClass('show');
                        return [4 /*yield*/, FunctionUtils_2.Delay(3000)];
                    case 1:
                        _a.sent();
                        popup.removeClass('show');
                        showingPromise = null;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, showingPromise];
                    case 3:
                        _a.sent();
                        displaySuccess(message);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    var metaSmoke = new MetaSmokeyAPI_1.MetaSmokeyAPI(metaSmokeKey);
    var natty = new NattyApi_1.NattyAPI();
    function DaysBetween(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
    function SetupPostPage() {
        var postMenus = $('.post-menu');
        var questionTime = new Date($('.post-signature.owner .user-action-time .relativetime').attr('title'));
        postMenus.each(function (index, item) {
            var jqueryItem = $(item);
            var postType = jqueryItem.closest('.answercell').length > 0
                ? 'Answer'
                : 'Question';
            var postId = parseInt(jqueryItem.find('.flag-post-link').attr('data-postid'), 10);
            var reputationDiv = jqueryItem.closest(postType === 'Answer' ? '.answercell' : '.postcell').find('.reputation-score');
            var reputationText = reputationDiv.text();
            if (reputationText.indexOf('k') !== -1) {
                reputationText = reputationDiv.attr('title').substr('reputation score '.length);
            }
            reputationText = reputationText.replace(',', '');
            var reputation = parseInt(reputationText, 10);
            var advancedFlaggingLink = $('<a />').text('Advanced Flagging');
            var dropDown = $('<dl />').css({
                'margin': '0',
                'z-index': '1',
                'position': 'absolute',
                'white-space': 'nowrap',
                'background': '#FFF',
                'padding': '5px',
                'border': '1px solid #9fa6ad',
                'box-shadow': '0 2px 4px rgba(36,39,41,0.3)',
                'cursor': 'default'
            }).hide();
            var linkStyle = { 'display': 'inline-block', 'margin-top': '5px', 'width': 'auto' };
            var checkboxName = "comment_checkbox_" + postId;
            var leaveCommentBox = $('<input />')
                .attr('type', 'checkbox')
                .attr('name', checkboxName);
            var postDiv = jqueryItem.closest(postType === 'Answer' ? '.answer' : '.question');
            var comments = postDiv.find('.comment-body');
            if (comments.length === 0) {
                leaveCommentBox.prop('checked', true);
            }
            var metaSmokeWasReported = metaSmoke.GetFeedback(postId, postType);
            var nattyWasReported = natty.WasReported(postId);
            var performedActionIcon = getPerformedActionIcon();
            var reportedIcon = getReportedIcon();
            var getDivider = function () { return $('<hr />').css({ 'margin-bottom': '10px', 'margin-top': '10px' }); };
            var hasCommentOptions = false;
            var firstCategory = true;
            FlagTypes_1.flagCategories.forEach(function (flagCategory) {
                if (flagCategory.AppliesTo.indexOf(postType) === -1) {
                    return;
                }
                if (!firstCategory) {
                    dropDown.append(getDivider());
                }
                flagCategory.FlagTypes.forEach(function (flagType) {
                    if (flagType.Comment || (flagType.Comments && flagType.Comments.length > 0)) {
                        hasCommentOptions = true;
                    }
                    var dropdownItem = $('<dd />');
                    if (flagCategory.BoxStyle) {
                        dropdownItem.css(flagCategory.BoxStyle);
                    }
                    var nattyLinkItem = $('<a />').css(linkStyle);
                    nattyLinkItem.click(function () {
                        var result = handleFlagAndComment(postId, flagType, leaveCommentBox.is(':checked'), reputation);
                        if (result.CommentPromise) {
                            result.CommentPromise.then(function (data) {
                                var commentUI = StackExchangeGlobal.comments.uiForPost($('#comments-' + postId));
                                commentUI.addShow(true, false);
                                commentUI.showComments(data, null, false, true);
                                $(document).trigger('comment', postId);
                            });
                        }
                        if (result.FlagPromise) {
                            result.FlagPromise.then(function () {
                                Caching_4.StoreInCache("AdvancedFlagging.Flagged." + postId, flagType);
                                reportedIcon.attr('title', "Flagged as " + flagType.ReportType);
                                reportedIcon.show();
                            });
                        }
                        var noFlag = flagType.ReportType === 'NoFlag';
                        if (noFlag && result.PerformedActionPromise) {
                            result.PerformedActionPromise.then(function () {
                                Caching_4.StoreInCache("AdvancedFlagging.PerformedAction." + postId, flagType);
                                performedActionIcon.attr('title', "Performed action: " + flagType.DisplayName);
                                performedActionIcon.show();
                            });
                        }
                        var rudeFlag = flagType.ReportType === 'PostSpam' || flagType.ReportType === 'PostOffensive';
                        var naaFlag = flagType.ReportType === 'AnswerNotAnAnswer';
                        var needsEditing = flagType.DisplayName === 'Needs Editing';
                        metaSmokeWasReported.then(function (responseItems) {
                            if (responseItems.length > 0) {
                                var metaSmokeId = responseItems[0].id;
                                if (rudeFlag) {
                                    metaSmoke.ReportTruePositive(metaSmokeId).then(function () { return displaySuccess('Feedback sent to MS'); });
                                }
                                else if (naaFlag) {
                                    metaSmoke.ReportNAA(metaSmokeId).then(function () { return displaySuccess('Feedback sent to MS'); });
                                }
                                else if (noFlag) {
                                    metaSmoke.ReportFalsePositive(metaSmokeId).then(function () { return displaySuccess('Feedback sent to MS'); });
                                }
                            }
                            else if (rudeFlag) {
                                metaSmoke.Report(postId, postType).then(function () { return displaySuccess('Reported to MS'); });
                            }
                        });
                        nattyWasReported.then(function (wasReported) {
                            if (wasReported) {
                                if (naaFlag || rudeFlag) {
                                    natty.ReportTruePositive(postId).then(function () { return displaySuccess('Feedback sent to natty'); });
                                }
                                else if (noFlag) {
                                    if (needsEditing) {
                                        natty.ReportNeedsEditing(postId).then(function () { return displaySuccess('Feedback sent to natty'); });
                                    }
                                    else {
                                        natty.ReportFalsePositive(postId).then(function () { return displaySuccess('Feedback sent to natty'); });
                                    }
                                }
                            }
                            else if (naaFlag) {
                                var answerTime = new Date(jqueryItem.closest('.answercell').find('.post-signature .user-action-time:contains("answered") .relativetime').attr('title'));
                                var answerAge = DaysBetween(answerTime, new Date());
                                var daysPostedAfterQuestion = DaysBetween(questionTime, answerTime);
                                if (answerAge > 30 || daysPostedAfterQuestion < 30) {
                                    displaySuccess('Won\'t report to Natty - doesn\'t meet time requirements');
                                    return;
                                }
                                natty.Report(postId).then(function () { return displaySuccess('Reported to natty'); });
                            }
                        });
                        dropDown.hide();
                    });
                    nattyLinkItem.text(flagType.DisplayName);
                    dropdownItem.append(nattyLinkItem);
                    dropDown.append(dropdownItem);
                });
                firstCategory = false;
            });
            if (hasCommentOptions) {
                dropDown.append(getDivider());
                var commentBoxLabel = $('<label />').text('Leave comment')
                    .attr('for', checkboxName)
                    .css({
                    'margin-right': '5px',
                    'margin-left': '4px',
                });
                commentBoxLabel.click(function () { return leaveCommentBox.click(); });
                var commentingRow = $('<dd />');
                commentingRow.append(commentBoxLabel);
                commentingRow.append(leaveCommentBox);
                dropDown.append(commentingRow);
            }
            advancedFlaggingLink.append(dropDown);
            $(window).click(function () {
                dropDown.hide();
            });
            advancedFlaggingLink.click(function (e) {
                e.stopPropagation();
                if (e.target === advancedFlaggingLink.get(0)) {
                    dropDown.toggle();
                }
            });
            jqueryItem.append(advancedFlaggingLink);
            jqueryItem.append(performedActionIcon);
            jqueryItem.append(reportedIcon);
            var nattyIcon = getNattyIcon();
            var smokeyIcon = getSmokeyIcon();
            metaSmokeWasReported
                .then(function (responseItems) {
                if (responseItems.length > 0) {
                    var metaSmokeId_1 = responseItems[0].id;
                    smokeyIcon.click(function () {
                        window.open("https://metasmoke.erwaysoftware.com/post/" + metaSmokeId_1, '_blank');
                    });
                    smokeyIcon.show();
                }
            });
            nattyWasReported
                .then(function (wasReported) {
                if (wasReported) {
                    nattyIcon.show();
                    nattyIcon.click(function () {
                        window.open("https://sentinel.erwaysoftware.com/posts/aid/" + postId, '_blank');
                    });
                }
            });
            var previousFlagPromise = Caching_4.GetFromCache("AdvancedFlagging.Flagged." + postId);
            previousFlagPromise.then(function (previousFlag) {
                if (previousFlag) {
                    reportedIcon.attr('title', "Previously flagged as " + previousFlag.ReportType);
                    reportedIcon.show();
                }
            });
            var previousPerformedActionPromise = Caching_4.GetFromCache("AdvancedFlagging.PerformedAction." + postId);
            previousPerformedActionPromise.then(function (previousAction) {
                if (previousAction && previousAction.ReportType === 'NoFlag') {
                    performedActionIcon.attr('title', "Previously performed action: " + previousAction.DisplayName);
                    performedActionIcon.show();
                }
            });
            jqueryItem.append(nattyIcon);
            jqueryItem.append(smokeyIcon);
            // xdLocalStorage.clear(function (data) { /* callback */ });
        });
    }
    function getPerformedActionIcon() {
        return $('<div>').addClass('comment-flag')
            .css({ 'margin-left': '5px', 'background-position': '-61px -320px', 'visibility': 'visible' })
            .css({ 'width': '15px', 'height': '15px', 'background-position': '-20px -320px' })
            .css({ 'cursor': 'default' })
            .hide();
    }
    function getReportedIcon() {
        return $('<div>').addClass('comment-flag')
            .css({ 'margin-left': '5px', 'background-position': '-61px -320px', 'visibility': 'visible' })
            .css({ 'cursor': 'default' })
            .hide();
    }
    function getNattyIcon() {
        return $('<div>')
            .css({
            'width': '15px', 'height': '16px', 'margin-left': '5px', 'vertical-align': 'text-bottom', 'cursor': 'pointer',
            'background': 'url("https://i.stack.imgur.com/aMUMt.jpg?s=328&g=1"', 'background-size': '100%'
        })
            .attr('title', 'Reported by Natty')
            .hide();
    }
    function getSmokeyIcon() {
        return $('<div>')
            .css({
            'width': '15px', 'height': '16px', 'margin-left': '5px', 'vertical-align': 'text-bottom', 'cursor': 'pointer',
            'background': 'url("https://i.stack.imgur.com/WyV1l.png?s=128&g=1"', 'background-size': '100%'
        })
            .attr('title', 'Reported by Smokey')
            .hide();
    }
    function SetupAnswerLinks() {
        $('a.answer-hyperlink').each(function (index, item) {
            var jqueryItem = $(item);
            var displayStyle = { 'display': 'inline-block' };
            var performedActionIcon = getPerformedActionIcon();
            var reportedIcon = getReportedIcon();
            var nattyIcon = getNattyIcon();
            var smokeyIcon = getSmokeyIcon();
            jqueryItem.after(smokeyIcon);
            jqueryItem.after(nattyIcon);
            jqueryItem.after(reportedIcon);
            jqueryItem.after(performedActionIcon);
            var hyperLink = jqueryItem.attr('href');
            var postId = parseInt(hyperLink.split('#')[1], 10);
            var metaSmoke = new MetaSmokeyAPI_1.MetaSmokeyAPI(metaSmokeKey);
            var metaSmokeWasReported = metaSmoke.GetFeedback(postId, 'Answer');
            var natty = new NattyApi_1.NattyAPI();
            var nattyWasReported = natty.WasReported(postId);
            var previousFlagPromise = Caching_4.GetFromCache("AdvancedFlagging.Flagged." + postId);
            previousFlagPromise.then(function (previousFlag) {
                if (previousFlag) {
                    reportedIcon.attr('title', "Previously flagged as " + previousFlag.ReportType);
                    reportedIcon.show();
                }
            });
            var previousPerformedActionPromise = Caching_4.GetFromCache("AdvancedFlagging.PerformedAction." + postId);
            previousPerformedActionPromise.then(function (previousAction) {
                if (previousAction && previousAction.ReportType === 'NoFlag') {
                    performedActionIcon.attr('title', "Previously performed action: " + previousAction.DisplayName);
                    performedActionIcon.show();
                }
            });
            metaSmokeWasReported
                .then(function (responseItems) {
                if (responseItems.length > 0) {
                    var metaSmokeId_2 = responseItems[0].id;
                    smokeyIcon.click(function () {
                        window.open("https://metasmoke.erwaysoftware.com/post/" + metaSmokeId_2, '_blank');
                    });
                    smokeyIcon.css(displayStyle);
                }
            });
            nattyWasReported
                .then(function (wasReported) {
                if (wasReported) {
                    nattyIcon.css(displayStyle);
                    nattyIcon.click(function () {
                        window.open("https://sentinel.erwaysoftware.com/posts/aid/" + postId, '_blank');
                    });
                }
            });
        });
    }
    function SetupAdminTools() {
        var bottomBox = $('.-copyright, text-right').children('.g-column').children('.-list');
        var optionsDiv = $('<div>').text('AdvancedFlagging Admin');
        bottomBox.after(optionsDiv);
        var optionsList = $('<ul>').css({ 'list-style': 'none' });
        var clearMetaSmokeConfig = $('<a />').text('Clear Metasmoke Configuration');
        clearMetaSmokeConfig.click(function () {
            metaSmoke.Reset();
        });
        var clearAllCachedInfo = $('<a />').text('Clear all cached info');
        clearAllCachedInfo.click(function () {
            Caching_4.ClearCache();
        });
        optionsDiv.append(optionsList);
        optionsList.append($('<li>').append(clearMetaSmokeConfig));
        optionsList.append($('<li>').append(clearAllCachedInfo));
    }
    $(function () {
        Caching_4.InitializeCache('https://metasmoke.erwaysoftware.com/xdom_storage.html');
        var parsedPage = StackExchangeWebParser_1.parseCurrentPage();
        if (parsedPage) {
            console.log(parsedPage.Posts);
        }
        SetupPostPage();
        SetupAnswerLinks();
        SetupAdminTools();
        setupStyles();
        document.body.appendChild(popup.get(0));
    });
});
require(['AdvancedFlagging']);
define("libs/StackExchangeApi.Interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("libs/StackExchangeApi", ["require", "exports", "libs/Caching", "libs/FunctionUtils"], function (require, exports, Caching_5, FunctionUtils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var stackExchangeApiURL = '//api.stackexchange.com/2.2';
    var StackExchangeAPI = /** @class */ (function () {
        function StackExchangeAPI(clientId, key) {
            this.initializeAccessToken(clientId, key);
        }
        StackExchangeAPI.prototype.initializeAccessToken = function (clientId, key) {
            if (typeof clientId === 'string') {
                this.getAccessTokenPromise = function () { return Promise.resolve(clientId); };
                return;
            }
            if (!clientId || !key) {
                this.getAccessTokenPromise = function () { throw Error('Access token not available. StackExchangeAPI class must be passed either an access token, or a clientId and a key.'); };
                return;
            }
            this.getAccessTokenPromise = function () { return new Promise(function (resolve, reject) {
                SE.init({
                    clientId: clientId,
                    key: key,
                    channelUrl: window.location,
                    complete: function (data) {
                        SE.authenticate({
                            success: function (result) {
                                resolve(result.accessToken);
                            },
                            error: function (error) {
                                reject(error);
                            },
                            networkUsers: true
                        });
                    }
                });
            }); };
        };
        StackExchangeAPI.prototype.Answers_GetComments = function (answerIds, skipCache, site, filter) {
            if (skipCache === void 0) { skipCache = false; }
            if (site === void 0) { site = 'stackoverflow'; }
            return this.MakeRequest(function (objectId) { return "StackExchange.Api.AnswerComments." + objectId; }, function (objectIds) { return stackExchangeApiURL + "/answers/" + objectIds.join(';') + "/comments"; }, function (comment) { return comment.post_id; }, answerIds, skipCache, site, true, filter);
        };
        StackExchangeAPI.prototype.MakeRequest = function (cacheKey, apiUrl, uniqueIdentifier, objectIds, skipCache, site, multi, filter) {
            var cachedResultsPromise = this.GetCachedItems(objectIds.slice(), skipCache, cacheKey);
            return new Promise(function (resolve, reject) {
                if (objectIds.length > 0) {
                    var url = apiUrl(objectIds) + ("?site=" + site);
                    if (filter) {
                        url += "?filter=" + filter;
                    }
                    ;
                    $.ajax({
                        url: url,
                        type: 'GET',
                    }).done(function (data, textStatus, jqXHR) {
                        var returnItems = (data.items || []);
                        var grouping = FunctionUtils_3.GroupBy(returnItems, uniqueIdentifier);
                        FunctionUtils_3.GetMembers(grouping).forEach(function (key) { return Caching_5.StoreInCache(cacheKey(parseInt(key, 10)), grouping[key]); });
                        cachedResultsPromise.then(function (cachedResults) {
                            cachedResults.forEach(function (result) {
                                returnItems.push(result);
                            });
                            resolve(returnItems);
                        });
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        reject({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
                    });
                }
                else {
                    cachedResultsPromise.then(function (cachedResults) { return resolve(cachedResults); });
                }
            });
        };
        StackExchangeAPI.prototype.GetCachedItems = function (objectIds, skipCache, cacheKey) {
            var cachedResults = [];
            var promises = [];
            if (!skipCache) {
                objectIds.forEach(function (objectId) {
                    var cachedResultPromise = Caching_5.GetFromCache(cacheKey(objectId));
                    var tempPromise = new Promise(function (resolve) {
                        cachedResultPromise.then(function (cachedResult) {
                            if (cachedResult) {
                                var itemIndex = objectIds.indexOf(objectId);
                                if (itemIndex > -1) {
                                    objectIds.splice(itemIndex, 1);
                                }
                                cachedResult.forEach(function (r) { return cachedResults.push(r); });
                            }
                            resolve();
                        });
                    });
                    promises.push(tempPromise);
                });
            }
            return new Promise(function (resolve) {
                Promise.all(promises).then(function () {
                    resolve(cachedResults);
                });
            });
        };
        return StackExchangeAPI;
    }());
    exports.StackExchangeAPI = StackExchangeAPI;
});