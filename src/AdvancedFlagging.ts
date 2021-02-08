import { FlagType, flagCategories } from './FlagTypes';
import { StackExchangeGlobal } from '@userscriptTools/sotools/StackExchangeConfiguration';
import { IsStackOverflow, parseQuestionsAndAnswers, parseDate } from '@userscriptTools/sotools/sotools';
import { NattyAPI } from '@userscriptTools/nattyapi/NattyApi';
import { GenericBotAPI } from '@userscriptTools/genericbotapi/GenericBotAPI';
import { MetaSmokeAPI } from '@userscriptTools/metasmokeapi/MetaSmokeAPI';
import { CopyPastorAPI, CopyPastorFindTargetResponseItem } from '@userscriptTools/copypastorapi/CopyPastorAPI';
import { WatchFlags, WatchRequests } from '@userscriptTools/sotools/RequestWatcher';
import { SetupConfiguration } from 'Configuration';
import { GreaseMonkeyCache } from '@userscriptTools/caching/GreaseMonkeyCache';
import * as globals from './GlobalVars';

declare const GM_addStyle: any;
declare const StackExchange: StackExchangeGlobal;
declare const Svg: any;

function SetupStyles() {
    GM_addStyle(`
#snackbar {
    margin-left: -125px;
}

#snackbar.show {
    opacity: 1;
    transition: opacity 1s ease-out;
    -ms-transition: opacity 1s ease-out;
    -moz-transition: opacity 1s ease-out;
    -webkit-transition: opacity 1s ease-out;
}

#snackbar.hide {
    opacity: 0;
    transition: opacity 1s ease-in;
    -ms-transition: opacity 1s ease-in;
    -moz-transition: opacity 1s ease-in;
    -webkit-transition: opacity 1s ease-in;
}

.advanced-flagging-dialog {
    min-width: 10rem !important;
}

.advanced-flagging-natty-icon {
    background-image: url("https://i.stack.imgur.com/aMUMt.jpg?s=128&g=1");
}

.advanced-flagging-gut-icon {
    background-image: url("https://i.stack.imgur.com/A0JRA.png?s=128&g=1");
}

.advanced-flagging-smokey-icon {
    background-image: url("https://i.stack.imgur.com/7cmCt.png?s=128&g=1");
}`);
}

const userFkey = StackExchange.options.user.fkey;
function handleFlagAndComment(postId: number, flag: FlagType,
    flagRequired: boolean,
    commentText: string | undefined,
    copyPastorPromise: Promise<CopyPastorFindTargetResponseItem[]>
) {
    const result: {
        CommentPromise?: Promise<string>;
        FlagPromise?: Promise<string>;
    } = {};

    if (commentText) {
        result.CommentPromise = new Promise((resolve, reject) => {
            $.ajax({
                url: `/posts/${postId}/comments`,
                type: 'POST',
                data: { fkey: userFkey, comment: commentText }
            }).done((data) => {
                resolve(data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                reject({ jqXHR, textStatus, errorThrown });
            });
        });
    }

    if (flagRequired && flag.ReportType !== 'NoFlag') {
        // eslint-disable-next-line no-async-promise-executor
        result.FlagPromise = new Promise(async (resolve, reject) => {
            const flagText = await copyPastorPromise.then(results => {
                if (flag.GetCustomFlagText && results.length > 0) {
                    return flag.GetCustomFlagText(results[0]);
                }
            });

            autoFlagging = true;
            $.ajax({
                url: `//${window.location.hostname}/flags/posts/${postId}/add/${flag.ReportType}`,
                type: 'POST',
                data: { fkey: userFkey, otherText: flag.ReportType === 'PostOther' ? flagText : '' }
            }).done((data) => {
                setTimeout(() => autoFlagging = false, 500);
                resolve(data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                reject({ jqXHR, textStatus, errorThrown });
            });
        });
    }
    return result;
}

const popupWrapper = globals.popupWrapper;
let toasterTimeout: number | null = null;
let toasterFadeTimeout: number | null = null;

function hidePopup() {
    popupWrapper.removeClass('show').addClass('hide');
    toasterFadeTimeout = window.setTimeout(() => popupWrapper.empty().addClass('hide'), 1000);
}

export function displayToaster(message: string, state: string) {
    const messageDiv = globals.getMessageDiv(message, state);

    popupWrapper.append(messageDiv);
    popupWrapper.removeClass('hide').addClass('show');

    if (toasterFadeTimeout) clearTimeout(toasterFadeTimeout);
    if (toasterTimeout) clearTimeout(toasterTimeout);
    toasterTimeout = window.setTimeout(hidePopup, globals.popupDelay);
}

function displaySuccessFlagged(reportedIcon: JQuery, reportTypeHuman?: string) {
    const flaggedMessage = `Flagged ${reportTypeHuman}`;
    reportedIcon.attr('title', flaggedMessage);
    globals.showInlineElement(reportedIcon);
    globals.displaySuccess(flaggedMessage);
}

function displayErrorFlagged(message: string, error: any) {
    globals.displayError(message);
    console.error(error);
}

function getStrippedComment(commentText: string) {
    return commentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Match [links](...)
                      .replace(/\[([^\]]+)\][^(]*?/g, '$1') // Match [edit]
                      .replace(/_([^_]+)_/g, '$1') //  _thanks_ => thanks
                      .replace(/\*\*([^*]+)\*\*/g, '$1') // **thanks** => thanks
                      .replace(/\*([^*]+)\*/g, '$1') // *thanks* => thanks
                      .replace(' - From Review', '');
}

function upvoteSameComments(element: JQuery, strippedCommentText: string) {
    element.find('.comment-body .comment-copy').each((_index, el) => {
        const element = $(el), text = element.text();
        if (text !== strippedCommentText) return;

        element.closest('li').find('a.comment-up.comment-up-off').trigger('click');
    });
}

function getErrorMessage(responseJson: any) {
    let message = 'Failed to flag: ';
    if (responseJson.Message.match('already flagged')) {
        message += 'post already flagged';
    } else if (responseJson.Message.match('limit reached')) {
        message += 'post flag limit reached';
    } else {
        message += responseJson.Message;
    }
    return message;
}

function getPromiseFromFlagName(flagName: string, reporter: Reporter) {
    switch (flagName) {
        case 'Needs Editing': return reporter.ReportNeedsEditing();
        case 'Vandalism': return reporter.ReportVandalism();
        case 'Looks Fine': return reporter.ReportLooksFine();
        case 'Duplicate answer': return reporter.ReportDuplicateAnswer();
        case 'Plagiarism': return reporter.ReportPlagiarism();
        case 'Bad attribution': return reporter.ReportPlagiarism();
        default:
            throw new Error('Could not find custom flag type: ' + flagName);
    }
}

function showComments(postId: number, data: any) {
    const commentUI = StackExchange.comments.uiForPost($('#comments-' + postId));
    commentUI.addShow(true, false);
    commentUI.showComments(data, null, false, true);
    $(document).trigger('comment', postId);
}

function setupNattyApi(postId: number, nattyIcon?: JQuery) {
    const nattyApi = new NattyAPI(postId);
    nattyIcon
        ? nattyApi.Watch().subscribe(reported => reported ? globals.showInlineElement(nattyIcon) : nattyIcon.addClass('d-none'))
        : nattyApi.Watch();

    return {
        name: 'Natty',
        ReportNaa: (answerDate: Date, questionDate: Date) => nattyApi.ReportNaa(answerDate, questionDate),
        ReportRedFlag: () => nattyApi.ReportRedFlag(),
        ReportLooksFine: () => nattyApi.ReportLooksFine(),
        ReportNeedsEditing: () => nattyApi.ReportNeedsEditing(),
        ReportVandalism: () => Promise.resolve(false),
        ReportDuplicateAnswer: () => Promise.resolve(false),
        ReportPlagiarism: () => Promise.resolve(false)
    };
}

function setupGenericBotApi(postId: number) {
    const genericBotAPI = new GenericBotAPI(postId);
    return {
        name: 'Generic Bot',
        ReportNaa: () => genericBotAPI.ReportNaa(),
        ReportRedFlag: () => Promise.resolve(false),
        ReportLooksFine: () => genericBotAPI.ReportLooksFine(),
        ReportNeedsEditing: () => genericBotAPI.ReportNeedsEditing(),
        ReportVandalism: () => Promise.resolve(true),
        ReportDuplicateAnswer: () => Promise.resolve(false),
        ReportPlagiarism: () => Promise.resolve(false)
    };
}

function setupMetasmokeApi(postId: number, postType: 'Answer' | 'Question', smokeyIcon: JQuery) {
    const metaSmoke = new MetaSmokeAPI();
    metaSmoke.Watch(postId, postType).subscribe(id => {
        if (!id) {
            smokeyIcon.addClass('d-none');
            return;
        }

        smokeyIcon.click(() => {
            window.open(`https://metasmoke.erwaysoftware.com/post/${id}`, '_blank');
        });
        globals.showInlineElement(smokeyIcon);
    });

    return {
        name: 'Smokey',
        ReportNaa: () => metaSmoke.ReportNaa(postId, postType),
        ReportRedFlag: () => metaSmoke.ReportRedFlag(postId, postType),
        ReportLooksFine: () => metaSmoke.ReportLooksFine(postId, postType),
        ReportNeedsEditing: () => metaSmoke.ReportNeedsEditing(postId, postType),
        ReportVandalism: () => metaSmoke.ReportVandalism(postId, postType),
        ReportDuplicateAnswer: () => Promise.resolve(false),
        ReportPlagiarism: () => Promise.resolve(false)
    };
}

function setupGuttenbergApi(copyPastorApi: CopyPastorAPI) {
    return {
        name: 'Guttenberg',
        ReportNaa: () => copyPastorApi.ReportFalsePositive(),
        ReportRedFlag: () => Promise.resolve(false),
        ReportLooksFine: () => copyPastorApi.ReportFalsePositive(),
        ReportNeedsEditing: () => copyPastorApi.ReportFalsePositive(),
        ReportVandalism: () => copyPastorApi.ReportFalsePositive(),
        ReportDuplicateAnswer: () => copyPastorApi.ReportTruePositive(),
        ReportPlagiarism: () => copyPastorApi.ReportTruePositive()
    };
}

async function waitForCommentPromise(commentPromise: Promise<string>, postId: number) {
    try {
        const commentPromiseValue = await commentPromise;
        showComments(postId, commentPromiseValue);
    } catch (error) {
        globals.displayError('Failed to comment on post');
        console.error(error);
    }
}

async function waitForFlagPromise(flagPromise: Promise<string>, reportedIcon: JQuery, reportTypeHuman?: string) {
    try {
        const flagPromiseValue = await flagPromise;
        const responseJson = JSON.parse(JSON.stringify(flagPromiseValue)) as StackExchangeFlagResponse;
        if (responseJson.Success) {
            displaySuccessFlagged(reportedIcon, reportTypeHuman);
        } else { // sometimes, although the status is 200, the post isn't flagged.
            const fullMessage = `Failed to flag the post with outcome ${responseJson.Outcome}: ${responseJson.Message}.`;
            const message = getErrorMessage(responseJson);
            displayErrorFlagged(message, fullMessage);
        }
    } catch(error) {
        displayErrorFlagged('Failed to flag post', error);
    }
}

function getHumanFromDisplayName(displayName: string) {
    switch (displayName) {
        case 'AnswerNotAnAnswer': return 'as NAA';
        case 'PostOffensive': return 'as R/A';
        case 'PostSpam': return 'as spam';
        case 'NoFlag': return '';
        case 'PostOther': return 'for moderator attention';
        default: return '';
    }
}

interface Reporter {
    name: string;
    ReportNaa(answerDate: Date, questionDate: Date): Promise<boolean>;
    ReportRedFlag(): Promise<boolean>;
    ReportLooksFine(): Promise<boolean>;
    ReportNeedsEditing(): Promise<boolean>;
    ReportVandalism(): Promise<boolean>;
    ReportDuplicateAnswer(): Promise<boolean>;
    ReportPlagiarism(): Promise<boolean>;
}

interface StackExchangeFlagResponse {
    FlagType: number;
    Message: string;
    Outcome: number;
    ResultChangedState: boolean;
    Success: boolean;
}

async function BuildFlaggingDialog(element: JQuery,
    postId: number,
    postType: 'Question' | 'Answer',
    reputation: number,
    authorName: string,
    answerTime: Date,
    questionTime: Date,
    deleted: boolean,
    reportedIcon: JQuery,
    performedActionIcon: JQuery,
    reporters: Reporter[],
    copyPastorPromise: Promise<CopyPastorFindTargetResponseItem[]>
) {
    const dropDown = globals.dropDown.clone();
    const checkboxNameComment = `comment_checkbox_${postId}`;
    const checkboxNameFlag = `flag_checkbox_${postId}`;
    const leaveCommentBox = globals.getOptionBox(checkboxNameComment);
    const flagBox = globals.getOptionBox(checkboxNameFlag);
    flagBox.prop('checked', true);

    const isStackOverflow = IsStackOverflow();

    const comments = element.find('.comment-body');
    const defaultNoComment = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationDefaultNoComment);

    if (!defaultNoComment && !comments.length && isStackOverflow) leaveCommentBox.prop('checked', true);

    const enabledFlagIds = GreaseMonkeyCache.GetFromCache<number[]>(globals.ConfigurationEnabledFlags);

    let hasCommentOptions = false;
    let firstCategory = true;
    flagCategories.forEach(flagCategory => {
        if (flagCategory.AppliesTo.indexOf(postType) === -1) return;

        const divider = globals.getDivider();
        if (!firstCategory) dropDown.append(divider);

        const categoryDiv = globals.getCategoryDiv(flagCategory.IsDangerous);
        let activeLinks = flagCategory.FlagTypes.length;
        flagCategory.FlagTypes.forEach(flagType => {
            const reportLink = globals.reportLink.clone();
            hasCommentOptions = !!flagType.GetComment;
            const dropdownItem = globals.dropdownItem.clone();

            const disableLink = () => {
                activeLinks--;
                globals.hideElement(reportLink);
                if (!divider || activeLinks > 0) return;

                globals.hideElement(divider);
            };
            const enableLink = () => {
                activeLinks++;
                globals.showElement(reportLink);
                if (!divider || activeLinks <= 0) return;

                globals.showElement(divider);
            };

            disableLink();
            if (!enabledFlagIds || enabledFlagIds.indexOf(flagType.Id) > -1) {
                if (flagType.Enabled) {
                    copyPastorPromise.then(items => {
                        // If it somehow changed within the promise, check again
                        if (flagType.Enabled) {
                            const hasItems = items.length > 0;
                            const isEnabled = flagType.Enabled(hasItems);
                            if (isEnabled) enableLink();
                        } else {
                            enableLink();
                        }
                    });
                } else {
                    enableLink();
                }
            }

            let commentText: string | undefined;
            if (flagType.GetComment) {
                commentText = flagType.GetComment({ Reputation: reputation, AuthorName: authorName });
                reportLink.attr('title', commentText);
            }

            reportLink.click(async () => {
                if (!deleted) {
                    try {
                        if (!leaveCommentBox.is(':checked') && commentText) {
                            const strippedComment = getStrippedComment(commentText);
                            upvoteSameComments(element, strippedComment);
                            commentText = undefined;
                        }

                        const result = handleFlagAndComment(postId, flagType, flagBox.is(':checked'), commentText, copyPastorPromise);
                        if (result.CommentPromise) await waitForCommentPromise(result.CommentPromise, postId);
                        if (result.FlagPromise) await waitForFlagPromise(result.FlagPromise, reportedIcon, flagType.Human);
                    } catch (err) { globals.displayError(err); }
                }

                const noFlag = flagType.ReportType === 'NoFlag';
                if (noFlag) {
                    performedActionIcon.attr('title', `Performed action: ${flagType.DisplayName}`);
                    globals.showElement(performedActionIcon);
                }

                handleFlag(flagType, reporters, answerTime, questionTime);

                globals.hideElement(dropDown);
            });

            reportLink.text(flagType.DisplayName);
            dropdownItem.append(reportLink);
            categoryDiv.append(dropdownItem);

            dropDown.append(categoryDiv);
        });
        firstCategory = false;
    });

    hasCommentOptions = isStackOverflow;

    dropDown.append(globals.getDivider());
    if (hasCommentOptions) {
        const commentBoxLabel = globals.getOptionLabel('Leave comment', checkboxNameComment);

        const commentingRow = globals.plainDiv.clone();
        commentingRow.append(leaveCommentBox);
        commentingRow.append(commentBoxLabel);

        dropDown.append(commentingRow);
        commentingRow.children();
    }

    const flagBoxLabel = globals.getOptionLabel('Flag', checkboxNameComment);
    const flaggingRow = globals.plainDiv.clone();

    const defaultNoFlag = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationDefaultNoFlag);
    if (defaultNoFlag) flagBox.prop('checked', false);

    flaggingRow.append(flagBox);
    flaggingRow.append(flagBoxLabel);

    dropDown.append(flaggingRow);
    dropDown.append(globals.popoverArrow.clone());

    return dropDown;
}

function handleFlag(flagType: FlagType, reporters: Reporter[], answerTime: Date, questionTime: Date) {
    const rudeFlag = flagType.ReportType === 'PostSpam' || flagType.ReportType === 'PostOffensive';
    const naaFlag = flagType.ReportType === 'AnswerNotAnAnswer';
    const customFlag = flagType.ReportType === 'PostOther';
    const noFlag = flagType.ReportType === 'NoFlag';
    reporters.forEach(reporter => {
        let promise: Promise<boolean> | null = null;
        if (rudeFlag) {
            promise = reporter.ReportRedFlag();
        } else if (naaFlag) {
            promise = reporter.ReportNaa(answerTime, questionTime);
        } else if (noFlag || customFlag) {
            promise = getPromiseFromFlagName(flagType.DisplayName, reporter);
        }
        if (!promise) return;

        promise.then((didReport) => {
            if (!didReport) return;
            globals.displaySuccess(`Feedback sent to ${reporter.name}`);
        }).catch(() => {
            globals.displayError(`Failed to send feedback to ${reporter.name}.`);
        });
    });
}

let autoFlagging = false;
async function SetupPostPage() {
    // The Svg object is initialised after the body has loaded :(
    while (typeof Svg === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    parseQuestionsAndAnswers(async post => {
        if (!post.element.length) return;

        let iconLocation: JQuery;
        let advancedFlaggingLink: JQuery | null = null;

        const nattyIcon = globals.getNattyIcon().click(() => {
            window.open(`https://sentinel.erwaysoftware.com/posts/aid/${post.postId}`, '_blank');
        });

        const copyPastorIcon = globals.getGuttenbergIcon();
        const copyPastorApi = new CopyPastorAPI(post.postId, globals.copyPastorKey);
        const copyPastorObservable = copyPastorApi.Watch();

        const smokeyIcon = globals.getSmokeyIcon();
        const reporters: Reporter[] = [];
        if (post.type === 'Answer') {
            reporters.push(setupNattyApi(post.postId, nattyIcon));
            reporters.push(setupGenericBotApi(post.postId));
            reporters.push(setupGuttenbergApi(copyPastorApi));

            copyPastorObservable.subscribe(items => {
                if (!items.length) {
                    copyPastorIcon.addClass('d-none');
                    return;
                }
                copyPastorIcon.attr('Title', `Reported by CopyPastor - ${items.length}`);
                globals.showInlineElement(copyPastorIcon);
                copyPastorIcon.click(() =>
                    items.forEach(item => {
                        window.open('https://copypastor.sobotics.org/posts/' + item.post_id);
                    })
                );
            });
        }

        reporters.push(setupMetasmokeApi(post.postId, post.type, smokeyIcon));

        const performedActionIcon = globals.getPerformedActionIcon();
        const reportedIcon = globals.getReportedIcon();

        if (post.page === 'Question') {
            // Now we setup the flagging dialog
            iconLocation = iconLocation = post.element.find('.js-post-menu').children().first();
            advancedFlaggingLink = globals.advancedFlaggingLink.clone();

            const questionTime: Date = post.type === 'Answer' ? post.question.postTime : post.postTime;
            const answerTime: Date = post.postTime;
            const deleted = post.element.hasClass('deleted-answer');

            const isEnabled = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationWatchFlags);
            WatchFlags().subscribe(xhr => {
                if (!isEnabled || autoFlagging || xhr.status !== 200) return;

                const matches = globals.getFlagsUrlRegex(post.postId).exec(xhr.responseURL);
                if (!matches) return;

                const flagType = {
                    Id: 0,
                    ReportType: matches[1] as 'AnswerNotAnAnswer' | 'PostOffensive' | 'PostSpam' | 'NoFlag' | 'PostOther',
                    DisplayName: matches[1],
                    Human: getHumanFromDisplayName(matches[1]) as any
                };

                handleFlag(flagType, reporters, answerTime, questionTime);
                displaySuccessFlagged(reportedIcon, flagType.Human);
            });

            const linkDisabled = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationLinkDisabled);
            if (!linkDisabled) {
                const dropDown = await BuildFlaggingDialog(post.element, post.postId, post.type, post.authorReputation as number, post.authorName, answerTime, questionTime,
                    deleted,
                    reportedIcon,
                    performedActionIcon,
                    reporters,
                    copyPastorApi.Promise()
                );

                advancedFlaggingLink.append(dropDown);

                const link = advancedFlaggingLink;
                const openOnHover = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationOpenOnHover);
                link[openOnHover ? 'hover' : 'click'](e => {
                    e.stopPropagation();
                    if (e.target !== link.get(0)) return;

                    globals.showElement(dropDown);
                });

                if (openOnHover) {
                    link.mouseleave(e => {
                        e.stopPropagation();
                        globals.hideElement(dropDown);
                    });
                } else {
                    $(window).click(() => globals.hideElement(dropDown));
                }
                iconLocation.append(globals.gridCellDiv.clone().append(advancedFlaggingLink));
            }

            iconLocation.append(performedActionIcon);
            iconLocation.append(reportedIcon);
            iconLocation.append(nattyIcon);
            iconLocation.append(copyPastorIcon);
            iconLocation.append(smokeyIcon);

        } else {
            iconLocation = post.element.find('a.answer-hyperlink');

            iconLocation.after(smokeyIcon);
            iconLocation.after(copyPastorIcon);
            iconLocation.after(nattyIcon);
            iconLocation.after(reportedIcon);
            iconLocation.after(performedActionIcon);
        }
    });
}

function Setup() {
    MetaSmokeAPI.Setup(globals.metaSmokeKey);

    SetupPostPage();
    SetupStyles();
    SetupConfiguration();

    document.body.appendChild(popupWrapper.get(0));

    const watchedQueuesEnabled = GreaseMonkeyCache.GetFromCache<boolean>(globals.ConfigurationWatchQueues);
    const postDetails: { questionTime: Date, answerTime: Date }[] = [];
    if (!watchedQueuesEnabled) return;

    WatchRequests().subscribe((xhr) => {
        if (xhr.status !== 200) return;

        const parseReviewDetails = (review: string) => {
            const reviewJson = JSON.parse(review);
            const postId = reviewJson.postId;
            const content = $(reviewJson.content);
            postDetails[postId] = {
                questionTime: parseDate($('.post-signature.owner .user-action-time span', content).attr('title')),
                answerTime: parseDate($('.user-info .user-action-time span', content).attr('title'))
            };
        };

        // We can't just parse the page after a recommend/delete request, as the page will have sometimes already updated
        // This means we're actually grabbing the information for the following review

        // So, we watch the next-task requests and remember which post we were looking at for when a delete/recommend-delete vote comes through.
        // next-task is invoked when visiting the review queue
        // task-reviewed is invoked when making a response
        const isReviewItem = globals.isReviewItemRegex.exec(xhr.responseURL);
        if (isReviewItem) {
            const review = xhr.responseText;
            parseReviewDetails(review);
            return;
        }

        const matches = globals.isDeleteVoteRegex.exec(xhr.responseURL);
        if (!matches) return;

        const postIdStr = matches[1] || matches[2];
        const postId = parseInt(postIdStr, 10);
        const currentPostDetails = postDetails[postId];
        if (!currentPostDetails || !$('.answers-subheader').length) return;

        handleFlag(
            { Id: 0, ReportType: 'AnswerNotAnAnswer', DisplayName: 'AnswerNotAnAnswer' },
            [ setupNattyApi(postId) ],
            currentPostDetails.answerTime, currentPostDetails.questionTime
        );
    });
}

$(() => {
    let started = false;
    async function actionWatcher() {
        if (!started) {
            started = true;
            Setup();
        }
        $(window).off('focus', actionWatcher);
        $(window).off('mousemove', actionWatcher);
    }

    // If the window gains focus
    $(window).focus(actionWatcher);
    // Or we have mouse movement
    $(window).mousemove(actionWatcher);

    // Or the document is already focused,
    // Then we execute the script.
    // This is done to prevent DOSing dashboard apis, if a bunch of links are opened at once.
    if (document.hasFocus && document.hasFocus()) actionWatcher();
});
