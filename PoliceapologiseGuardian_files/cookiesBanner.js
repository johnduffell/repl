define([
    'common/utils/config',
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/modules/ui/message',
    'common/utils/mediator'
], function (
    config,
    $,
    cookies,
    detect,
    storage,
    template,
    userPrefs,
    Message,
    mediator
) {
    /**
     * Rules:
     *
     * UK / INT edition readers only
     * Never seen the cookie message before
     * Show once only
     * Show only on FIRST page view
     * Persist close state
     */
    function init() {
        var geoContinentCookie = cookies.get('GU_geo_continent');
        if (geoContinentCookie && geoContinentCookie.toUpperCase() === 'EU') {
            var EU_COOKIE_MSG = 'GU_EU_MSG',
                euMessageCookie = cookies.get(EU_COOKIE_MSG);
            if (!euMessageCookie || euMessageCookie != 'seen') {
                var link = 'https://www.theguardian.com/info/cookies',
                    txt = 'Welcome to the Guardian. This site uses cookies, read our policy <a href="' + link + '" class="cookie-message__link">here</a>',
                    opts = {important: true},
                    cookieLifeDays = 365,
                    msg = new Message('cookies', opts);
                msg.show(txt);
                cookies.add(EU_COOKIE_MSG, 'seen', cookieLifeDays);
                return true;
            }
        }
        mediator.emit('modules:ui:cookiesBanner:notShown');
    }

    return {
        init: init
    };

});
