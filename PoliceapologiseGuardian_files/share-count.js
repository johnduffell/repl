define([
    'common/utils/report-error',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/formatters',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/content/share-count.html',
    'text!common/views/content/share-count-immersive.html'
], function (
    reportError,
    $,
    ajax,
    detect,
    config,
    formatters,
    template,
    svgs,
    shareCountTemplate,
    shareCountImmersiveTemplate
) {
    var shareCount = 0,
        $shareCountEls = $('.js-sharecount'),
        $fullValueEls,
        $shortValueEls,
        tooltip = 'Facebook: <%=facebook%> \nTwitter: <%=twitter%>',
        counts = {
            facebook: 'n/a',
            twitter: 'n/a'
        };

    function incrementShareCount(amount) {
        if (amount !== 0) {
            shareCount += amount;
            var displayCount = shareCount.toFixed(0),
                formattedDisplayCount = formatters.integerCommas(displayCount),
                shortDisplayCount = displayCount > 10000 ? Math.round(displayCount / 1000) + 'k' : displayCount;
            $fullValueEls.text(formattedDisplayCount);
            $shortValueEls.text(shortDisplayCount);
        }
    }

    function updateTooltip() {
        $shareCountEls.attr('title', template(tooltip, counts));
    }

    function addToShareCount(val) {
        if ($shareCountEls.hasClass('js-sharecount-immersive')) {
            shareCountTemplate = template(shareCountImmersiveTemplate, {
                icon: svgs('share')
            });
        }

        $shareCountEls
            .removeClass('u-h')
            .html(shareCountTemplate)
            .css('display', '');

        $shortValueEls = $('.sharecount__value--short', $shareCountEls[0]); // limited to 1 el
        $fullValueEls = $('.sharecount__value--full', $shareCountEls[0]); // limited to 1 el

        if (detect.isBreakpoint({min: 'tablet'})) {
            var duration = 250,
                updateStep = 25,
                slices = duration / updateStep,
                amountPerStep = val / slices,
                currentSlice = 0,
                interval = window.setInterval(function () {
                    incrementShareCount(amountPerStep);
                    if (++currentSlice === slices) {
                        window.clearInterval(interval);
                    }
                }, updateStep);
        } else {
            incrementShareCount(val);
        }
    }

    return function () {
        // asking for social counts in preview "leaks" upcoming URLs to social sites.
        // when they then crawl them they get 404s which affects later sharing.
        // don't call counts in preview
        if ($shareCountEls.length && !config.page.isPreview) {
            var url = 'http://www.theguardian.com/' + config.page.pageId;
            try {
                ajax({
                    url: 'https://graph.facebook.com/' + url,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    var count = resp.shares || 0;
                    counts.facebook = count;
                    addToShareCount(count);
                    updateTooltip();
                });
                ajax({
                    url: 'https://cdn.api.twitter.com/1/urls/count.json?url=' + url,
                    type: 'jsonp',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    var count = resp.count || 0;
                    counts.twitter = count;
                    addToShareCount(count);
                    updateTooltip();
                });
            } catch (e) {
                reportError(new Error('Error retrieving share counts (' + e.message + ')'), {
                    feature: 'share-count'
                }, false);
            }
        }
    };
});
