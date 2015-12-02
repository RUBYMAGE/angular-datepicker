/*!
 * RM-DATEPICKER v1.0.0
 * http://rubymage.com
 *
 * Copyright 2015 Sergiu Ghenciu, RUBYMAGE
 * Released under the MIT license
 * https://github.com/RUBYMAGE/angular-datepicker/blob/master/LICENSE
 */

(function () {
    'use strict';

    var Module = angular.module('rmDatepicker', []);

    Module.constant('rmDatepickerConfig', {
        mondayStart: false,
        initState: "month",
        maxState: "decade",
        minState: "month",
        toggleState: true,

        decadeSize: 12,
        monthSize: 42, /* "auto" || fixed nr. (35 or 42) */

        min: null,
        max: null,
        format: "yyyy-MM-dd"
    });

    Module.directive("rmDatepicker", ['rmDatepickerConfig', '$compile', '$filter', '$document',
                            function (rmDatepickerConfig, $compile, $filter, $document) {

        var link = function (scope, element, attrs, ngModel) {
            var conf = angular.copy(rmDatepickerConfig);

            if (scope.rmConfig) {
                for (var prop in conf)
                    if (conf.hasOwnProperty(prop))
                        if (scope.rmConfig[prop] != undefined) conf[prop] = scope.rmConfig[prop];
            }
            if (conf.min) conf.min.setHours(0, 0, 0, 0);
            if (conf.max) conf.max.setHours(23, 59, 59, 999);

            var isInput = element[0].tagName.toUpperCase() == "INPUT";
            var isReached = {
                min: false,
                max: false
            };
            var daysInMonth = function (year, month) {
                return new Date(year, month + 1, 0).getDate();
            };
            var adjustDate = function (date) {
                var date = parseInt(date, 10);
                if (!isNaN(date)) {
                    var max = daysInMonth(scope.j.getFullYear(), scope.j.getMonth());
                    if (date < 1) date = 1;
                    if (date > max) date = max;
                    scope.j.setDate(date);
                }
            };
            var gen = {
                decade: function (oDate) {
                    var Y = oDate.getFullYear(),
                        m = oDate.getMonth(),
                        d = oDate.getDate(),
                        max,
                        i = 0,
                        n = conf.decadeSize || 12; // count of years in decade
                    var aDecade = new Array(n);

                    Y = Math.floor(Y / n) * n; // begin year of current decade

                    for (; i < n; Y++, i++) {
                        max = daysInMonth(Y, m);
                        if (d > max) d = max;
                        aDecade[i] = new Date(Y, m, d, 3, 0, 1, 0);
                    }
                    return aDecade;
                },
                year: function (oDate) {
                    var Y = oDate.getFullYear(),
                        m = 0,
                        d = oDate.getDate(),
                        max;
                    var aYear = [];
                    for (; m < 12; m++) {
                        max = daysInMonth(Y, m);
                        if (d > max) d = max;
                        aYear.push(new Date(Y, m, d, 3, 0, 1, 0));
                    }
                    return aYear;
                },
                month: function (oDate) {
                    var Y = oDate.getFullYear(),
                        m = oDate.getMonth(),
                        startDate = new Date(Y, m, 1, 3, 0, 1, 0),
                        n;
                    var startPos = startDate.getDay() || 7;
                    if (scope.mondayStart) startPos = startPos - 1 || 7;

                    if (conf.monthSize == "auto")
                        n = ( startPos + daysInMonth(Y, m) < 35 ) ? 35 : 42;
                    else
                        n = conf.monthSize;

                    startDate.setDate(-startPos + 1);
                    return gen.dates(startDate, n);
                },
                dates: function (startDate, n) {
                    var aDates = new Array(n),
                        current = new Date(startDate),
                        i = 0;
                    while (i < n) {
                        aDates[i++] = new Date(current);
                        current.setDate(current.getDate() + 1);
                    }
                    return aDates;
                }
            };
            var refresh = function (state) {
                state = state || scope.state;
                scope.aDates = gen[state](scope.j);

                if (conf.min) {
                    //if(scope.aDates[0] < conf.min) scope.aDates[0].setDate( conf.min.getDate() );
                    isReached.min = scope.aDates[0] < conf.min;
                }
                if (conf.max) {
                    var oDate = scope.aDates[scope.aDates.length - 1];
                    //if(oDate > conf.max) oDate.setDate( conf.max.getDate() );
                    isReached.max = oDate > conf.max;
                }
            };
            var init = function () {
                return refresh();
            };

            //TODO: optimize this method
            var isBefore = function (oDate1, oDate2) {
                if (scope.state == "decade")
                    return oDate1.getFullYear() < oDate2.getFullYear();

                if (scope.state == "year") {
                    if (oDate1.getFullYear() == oDate2.getFullYear())
                        return oDate1.getMonth() < oDate2.getMonth();
                    else
                        return oDate1.getFullYear() < oDate2.getFullYear();
                }

                return oDate1 < oDate2;
            };
            scope.isOff = function (oDate) {
                if (!conf.min && !conf.max)
                    return false;
                if (conf.min && isBefore(oDate, conf.min))
                    return true;
                if (conf.max && isBefore(conf.max, oDate))
                    return true;
            };
            scope.isActive = {
                year: function (oDate) {
                    return oDate.getFullYear() == scope.j.getFullYear();
                },
                month: function (oDate) {
                    return oDate.getMonth() == scope.j.getMonth();
                },
                date: function (oDate) {
                    return oDate.getDate() == scope.j.getDate();
                }
            };
            scope.isToday = function (oDate) {
                return scope.isActive.date(oDate)
                    && scope.isActive.month(oDate)
                    && scope.isActive.year(oDate);
            };

            scope.go = function (oDate) {
                if (scope.isOff(oDate)) return;

                if( isInput && scope.state == conf.minState && scope.isActive.month(oDate) ) {
                    scope.show = false;
                    overlay.css("display", "none");
                }

                var m = scope.j.getMonth();

                scope.j = new Date(oDate);
                if (conf.toggleState) scope.toggleState(1);

                if (m != scope.j.getMonth())
                    refresh();
            };
            scope.now = function () {
                scope.j = new Date();
                refresh();
            };
            scope.next = function (delta) {
                delta = delta || 1;

                if (delta > 0) {
                    if (isReached.max) return;
                }
                else {
                    if (isReached.min) return;
                }

                var Y = scope.j.getFullYear(),
                    m = scope.j.getMonth(),
                    d = scope.j.getDate();

                switch (scope.state) {
                    case "decade":
                        delta = delta * scope.aDates.length;
                    case "year":
                        scope.j.setFullYear(Y + delta, m, 15);
                        adjustDate(d);
                        break;
                    case "month":
                        scope.j.setMonth(m + delta, 15);
                        adjustDate(d);
                        break;
                    case "week" :
                        scope.j.setDate(d + (delta * 7));
                        break;
                }
                refresh();
            };
            scope.prev = function (delta) {
                // delta = (delta == undefined) ? 1 : Math.abs( delta );
                return scope.next(-delta || -1);
            };
            scope.toggleState = function (direction) {
                direction = direction || 1;

                if (scope.state == conf.maxState && direction == -1 ||
                    scope.state == conf.minState && direction == 1) {
                    return;
                }
                scope.state = scope.aStates[scope.aStates.indexOf(scope.state) + direction];
                refresh();
            };

            scope.mondayStart = conf.mondayStart;
            scope.aWeekDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            if (scope.mondayStart) scope.aWeekDay.push(scope.aWeekDay.shift());

            scope.aStates = ["decade", "year", "month"];
            scope.state = conf.initState;

            //TODO: this(together with rmInclude directive below) is a quick implementation, maybe there is a better idea
            scope.activeDateTpl = {
                decade: "{{aDates[0].getFullYear()}} - {{aDates[aDates.length-1].getFullYear()}}",
                year: "{{j.getFullYear()}}",
                month: "{{j | date: 'MMMM yyyy'}}",
                week: "{{ j | date: 'd MMMM yyyy' }}"
            };

            init(); // generate initial state

            var offset = function (objElement) {
                var x = 0, y = 0;

                if (objElement.offsetParent) {
                    do {
                        x += objElement.offsetLeft;
                        y += objElement.offsetTop;
                    } while (objElement = objElement.offsetParent);
                }
                return {top: y, left: x};
            };
            var togglePicker = function(toggle) {
                overlay.css("display", toggle ? "block" : "none");
                scope.show = toggle;
                scope.$apply();
            };
            var adjustPos = function (el) {
                var scrollX = window.scrollX,
                    scrollY = window.scrollY,
                    innerWidth = window.innerWidth,
                    innerHeight = window.innerHeight;

                if (window.innerWidth < 481)
                    return {top: scrollY, left: 0};

                var pos = offset(el),
                    marginBottom = scrollY + innerHeight - pos.top - el.clientHeight,
                    marginRight = scrollX + innerWidth - pos.left - el.clientWidth;

                if (marginBottom < 0) pos.top += marginBottom;
                if (pos.top < scrollY) pos.top = scrollY;
                if (marginRight < 0) pos.left += marginRight;
                if (pos.left < 0) pos.left = 0;

                return pos;
            };

            if (isInput) {
                scope.show = false;

                ngModel.$parsers.push(function(sDate) {
                    return new Date(sDate);
                });
                ngModel.$formatters.push(function(oDate) {
                    return $filter('date')(oDate, conf.format);
                });

                element.after($compile(TEMPLATE)(scope));

                var calendar = element.next();
                var overlay = angular.element('<div class="rm-overlay" style="display:none"></div>');
                    overlay.on('click', function() {
                        togglePicker(false);
                    });
                    $document.find('body').eq(0).append(overlay);

                element.on('click', function() {

                    if( window.innerWidth < 481 ) element[0].blur();
                    var pos = offset( element[0] );
                        pos.top += element[0].offsetHeight +1;

                    scope.style = {top: pos.top + "px", left: pos.left + "px"};
                    togglePicker(true);
                    pos = adjustPos(calendar[0]);
                    scope.style = {top: pos.top + "px", left: pos.left + "px"};
                    scope.$apply();
                });

                $document.on('keydown', function(e) {
                    if ([9, 13, 27].indexOf(e.keyCode) >= 0) togglePicker(false);
                });
            }
            else {
                scope.show = true;
                element.append($compile(TEMPLATE)(scope));
            }
        };

        //TODO: template may need optimization :)
        var TEMPLATE =
        '<div class="rm-datepicker" ng-class="{mondayStart: mondayStart}" ng-show="show" ng-style="style">' +
            '<div class="nav">' +
                '<a><i class="mi_arrow_back"></i></a>' +
                '<a class="back waves-effect" ng-click="toggleState(-1)" rm-include="activeDateTpl[state]"></a>' +
                '<a class="adjacent waves-effect" ng-click="prev()"><i class="mi_keyboard_arrow_up"></i></a>' +
                '<a class="adjacent waves-effect" ng-click="next()"><i class="mi_keyboard_arrow_down"></i></a>' +
                '<a class="today waves-effect" ng-click="now()">Today</a>' +
            '</div>' +
            '<div class="body" ng-include="\'rm-\' + state + \'.html\'"></div>' +
        '</div>' +

        '<script type="text/ng-template" id="rm-decade.html">' +
            '<div class="ng-class: state; square date">' +
                '<div ng-repeat="oDate in aDates" ng-class="{j: isActive[\'year\'](oDate), off: isOff(oDate)}">' +
                    '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate | date: \'yyyy\'}}</span></a>' +
                '</div>' +
            '</div>' +
        '</script>' +

        '<script type="text/ng-template" id="rm-year.html">' +
            '<div class="ng-class: state; square date">' +
                '<div ng-repeat="oDate in aDates" ng-class="{j: isActive[\'month\'](oDate), off: isOff(oDate)}">' +
                    '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate | date: \'MMM\'}}</span></a>' +
                '</div>' +
            '</div>' +
        '</script>' +

        '<script type="text/ng-template" id="rm-month.html">' +
            '<div class="day sunSat" ng-if="state == \'month\'">' +
                '<a ng-repeat="day in aWeekDay">{{day}}</a>' +
            '</div>' +
            '<div class="ng-class: state; square date">' +
                '<div ng-repeat="oDate in aDates" ng-class="{j: isActive[\'date\'](oDate), off: isOff(oDate), out: !isActive[\'month\'](oDate)}">' +
                    '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate.getDate()}}</span></a>' +
                '</div>' +
            '</div>' +
        '</script>';

        return {
            require: 'ngModel',
            scope: {
                j: '=ngModel', /* active date */
                rmConfig: "="
            },
            link: link
        }
    }]);

    Module.directive('rmInclude', ['$compile', function ($compile) {

        var link = function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.rmInclude);
                }
                , function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
        };

        return {
            restrict: "A",
            link: link
        };
    }]);


}());