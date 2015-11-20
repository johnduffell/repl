define([
    'common/utils/cookies'
], function (
    cookies
) {
    var MULTIVARIATE_ID_COOKIE = 'GU_mvt_id',
        VISITOR_ID_COOKIE = 's_vi',
        BROWSER_ID_COOKIE = 'bwid',
        // The full mvt ID interval is [1, 1000000]
        // Server side mvt IDs occupy [9000000, 1000000)
        // So the client-side mvt interval is [1, 899999]
        MAX_INT = 899999;

    function overwriteMvtCookie(testId) {
        // For test purposes only.
        cookies.add(MULTIVARIATE_ID_COOKIE, testId, 365);
    }

    function getMvtFullId() {
        var bwidCookie = cookies.get(BROWSER_ID_COOKIE),
            mvtidCookie = getMvtValue(),
            visitoridCookie = cookies.get(VISITOR_ID_COOKIE);

        if (!visitoridCookie) {
            visitoridCookie = 'unknown-visitor-id';
        }

        if (!bwidCookie) {
            bwidCookie = 'unknown-browser-id';
        }

        if (!mvtidCookie) {
            mvtidCookie = 'unknown-mvt-id';
        }

        return visitoridCookie + ' ' + bwidCookie + ' ' + mvtidCookie;
    }

    function getMvtValue() {
        return cookies.get(MULTIVARIATE_ID_COOKIE);
    }

    function getMvtNumValues() {
        return MAX_INT;
    }

    return {
        getMvtFullId: getMvtFullId,
        getMvtValue: getMvtValue,
        getMvtNumValues: getMvtNumValues,
        overwriteMvtCookie: overwriteMvtCookie,
        MAX_INT: MAX_INT
    };
});
