/*!
 * RM-DATEPICKER v1.0.0
 * http://rubymage.com
 *
 * Copyright 2015 Sergiu Ghenciu, RUBYMAGE
 * Released under the MIT license
 * https://github.com/RUBYMAGE/angular-datepicker/blob/master/LICENSE
 */

(function () {

    var Module = angular.module('rmDatepicker', []);

    Module.constant('rmDatepickerConfig', {
        mondayStart: false,
        textToday: "Today",

        initState: "month",
        maxState: "decade",
        minState: "month",
        toggleState: true,

        decadeSize: 12,
        monthSize: 42, /* "auto" || fixed nr. (35 or 42) */

        min: null,
        max: null,
        'default': new Date,

        activeMonthFormat: 'LLLL yyyy',
        format: "yyyy-MM-dd"
    });

    Module.directive("rmDatepicker", ['rmDatepickerConfig', '$compile', '$filter', '$document', '$timeout',
                            function (rmDatepickerConfig, $compile, $filter, $document, $timeout) {

        var link = function (scope, element, attrs, ngModel) {
            var conf = angular.copy(rmDatepickerConfig);
            
            var getDefault = function () {
                var defaultValue = new Date(conf.default.getTime());
                defaultValue.isDefault = true;
                return defaultValue;
            };

            scope.isDefault = true;
            var date = getDefault();
            var setDate = function (newDate) {
                if(newDate.isDefault) {
                    scope.isDefault = true;
                } else {
                    scope.val = newDate;
                }

                return date = newDate;
            };

            var getIsDefault = function () {
                return scope.isDefault;
            };

            scope.getDate = function () {
                return date;
            };

            var applyRmConfig = function (rmConfig) {
              if (rmConfig) {
                  for (var prop in conf)
                      if (conf.hasOwnProperty(prop))
                          if (rmConfig[prop] != undefined) conf[prop] = rmConfig[prop];

                  if (conf.min) conf.min.setHours(0, 0, 0, 0);
                  if (conf.max) conf.max.setHours(23, 59, 59, 999);

                  if(conf.min && conf.default < conf.min) {
                     conf.default = new Date(conf.min.getTime());
                  }
                  if(conf.max && conf.default > conf.max) {
                     conf.default = new Date(conf.max.getTime());
                  }
                  conf.default.setHours(3, 0, 1, 0);

                  getIsDefault() && (setDate(getDefault()));
                  if(isInput) {
                    ngModel.$viewValue = date;
                    ngModel.$validate();
                    if(ngModel.$invalid) {
                        scope.isDefault = true;
                        ngModel.$viewValue = setDate(getDefault());
                        scope.state = conf.initState;
                        ngModel.$validate();
                    }
                  }
                  refresh && refresh();
              }
            };
            scope.$watch('rmConfig', applyRmConfig, true);
            applyRmConfig(scope.rmConfig);

            var isInput = element[0].tagName.toUpperCase() == "INPUT";
            var isReached = {
                min: false,
                max: false
            };
            var daysInMonth = function (year, month) {
                return new Date(year, month + 1, 0).getDate();
            };
            var adjustDate = function (dayInMonth) {
                var dayInMonth = parseInt(dayInMonth, 10);
                if (!isNaN(date)) {
                    var max = daysInMonth(date.getFullYear(), date.getMonth());
                    if (dayInMonth < 1) dayInMonth = 1;
                    if (dayInMonth > max) dayInMonth = max;
                    date.setDate(dayInMonth);
                }
            };
            var gen = {
                decade: function (oDate) {
                    var Y = oDate.getFullYear(),
                        m = oDate.getMonth(),
                        d = oDate.getDate(),
                        max,
                        i = 0,
                        Ymin = conf.min ? conf.min.getFullYear() : 0;
                        n = conf.decadeSize || 12; // count of years in decade
                    var aDecade = new Array(n);

                    Y = Math.floor((Y - Ymin)  / n) * n + Ymin; // begin year of current decade

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
                scope.aDates = gen[state](date);

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
                    return oDate.getFullYear() == date.getFullYear();
                },
                month: function (oDate) {
                    return oDate.getMonth() == date.getMonth();
                },
                date: function (oDate) {
                    return oDate.getDate() == date.getDate();
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
                    togglePicker(false);
                }

                var m = date.getMonth();

                setDate(oDate);
                if(scope.state == conf.minState) {
                    scope.isDefault = false;
                    $timeout(function () {
                        ngModel.$setViewValue(oDate);
                        setDate(oDate);
                    });
                }
                if (conf.toggleState) scope.toggleState(1);

                if (m != date.getMonth())
                    refresh();
            };
            scope.now = function () {
                scope.isDefault = false;
                setDate(new Date);
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

                var Y = date.getFullYear(),
                    m = date.getMonth(),
                    d = date.getDate();

                switch (scope.state) {
                    case "decade":
                        delta = delta * scope.aDates.length;
                    case "year":
                        date.setFullYear(Y + delta, m, 15);
                        adjustDate(d);
                        break;
                    case "month":
                        date.setMonth(m + delta, 15);
                        adjustDate(d);
                        break;
                    case "week" :
                        date.setDate(d + (delta * 7));
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
            scope.textToday = conf.textToday;

            scope.aStates = ["decade", "year", "month"];
            scope.state = conf.initState;

            //TODO: this(together with rmInclude directive below) is a quick implementation, maybe there is a better idea
            scope.activeDateTpl = {
                decade: "{{aDates[0].getFullYear()}} - {{aDates[aDates.length-1].getFullYear()}}",
                year: "{{getDate().getFullYear()}}",
                month: "{{getDate()| date: '" + conf.activeMonthFormat.replace("'", "") + "'}}",
                week: "{{getDate() | date: 'd MMMM yyyy' }}"
            };

            var watch = function(newValue) {

                if(newValue && !(newValue instanceof Date)) {
                    newValue = new Date(newValue);
                }

                if(newValue instanceof Date && (newValue.toString() == 'Invalid Date' || newValue.isDefault)) {
                    newValue = null;
                }

                if (newValue instanceof Date) {
                    if( (!conf.min || conf.min < newValue) && (!conf.max || newValue < conf.max) ) {
                        scope.isDefault = false;
                        newValue.setHours(3, 0, 1, 0);
                        setDate(newValue);
                    } else if(!scope.isDefault) {
                        setDate(getDefault());
                    }

                    ngModel.$viewValue = ngModel.$formatters.reduceRight(function (prev, fn) { return fn(prev); }, newValue);
                    ngModel.$render();
                }

                refresh();
            };

            scope.$watch('val', watch);
            watch(scope.val);

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
            var togglePicker = function (toggle) {
                overlay.css("display", toggle ? "block" : "none");
                calendar.css("display", toggle ? "block" : "none");
            };
            var adjustPos = function (pos, el) {
                var scrollX = window.scrollX,
                    scrollY = window.scrollY,
                    innerWidth = window.innerWidth,
                    innerHeight = window.innerHeight;

                if (window.innerWidth < 481) {
                    return {top: scrollY, left: 0};
                }

                var marginBottom = scrollY + innerHeight - pos.top - el.clientHeight,
                    marginRight = scrollX + innerWidth - pos.left - el.clientWidth;

                if (marginBottom < 0) pos.top += marginBottom;
                if (pos.top < scrollY) pos.top = scrollY;
                if (marginRight < 0) pos.left += marginRight;
                if (pos.left < 0) pos.left = 0;

                return pos;
            };

            if (isInput) {
                ngModel.$parsers.push(function (sDate) {
                    var oDate;

                    if(sDate && !(sDate instanceof Date)) {
                        var oDate = new Date(sDate);

                        if($filter('date')(oDate, conf.format) != sDate) {
                            oDate = null;
                        }
                    }

                    if(sDate instanceof Date && sDate.toString() == 'Invalid Date') {
                        sDate = null;
                    }

                    return sDate instanceof Date ? sDate : date;
                });
                ngModel.$formatters.push(function (oDate) {
                    return getIsDefault() ? '' : $filter('date')(oDate, conf.format);
                });

                ngModel.$validators.required = function () {
                    return !attrs.required || !getIsDefault();
                };

                ngModel.$validators.range = function () {
                    return getIsDefault() || ((!conf.min || conf.min < date) && (!conf.max || date < conf.max));
                };

                var overlay = angular.element('<div class="rm-overlay" style="display:none"></div>');
                overlay.on('click', function () {
                    togglePicker(false);
                });
                $document.find('body').eq(0).append(overlay);
                overlay.after($compile(TEMPLATE)(scope));
                var calendar = overlay.next();
                calendar.css({display: "none"});
                calendar.addClass('it-is-input');

                element.on('click focus', function () {
                    if(element.prop('readonly')) {
                        return;
                    }

                    if (window.innerWidth < 481) element[0].blur();
                    var pos = offset(element[0]);
                    pos.top += element[0].offsetHeight + 1;

                    calendar.css({top: pos.top + "px", left: pos.left + "px", display: "block"});
                    togglePicker(true);
                    pos = adjustPos(pos, calendar[0]);
                    calendar.css({top: pos.top + "px", left: pos.left + "px"});
                });

                $document.on('keydown', function (e) {
                    if ([9, 13, 27].indexOf(e.keyCode) >= 0) togglePicker(false);
                });

                scope.$on('$destroy', function() {
                    calendar.remove();
                    overlay.remove();
                });
            }
            else {
                element.append($compile(TEMPLATE)(scope));
            }
        };

        //TODO: template may need optimization :)
        var TEMPLATE =
        '<div class="rm-datepicker" ng-class="{mondayStart: mondayStart}">' +
            '<div class="nav">' +
                '<a><i class="mi_arrow_back" ng-hide="state == \'decade\'"></i></a>' +
                '<a class="back waves-effect" ng-click="toggleState(-1)" rm-include="activeDateTpl[state]"></a>' +
                '<a class="adjacent waves-effect" ng-click="prev()"><i class="mi_keyboard_arrow_up"></i></a>' +
                '<a class="adjacent waves-effect" ng-click="next()"><i class="mi_keyboard_arrow_down"></i></a>' +
                '<a class="today waves-effect" ng-click="now()">{{textToday}}</a>' +
            '</div>' +
            '<div class="body" ng-include="\'rm-\' + state + \'.html\'"></div>' +
        '</div>';

        return {
            require: 'ngModel',
            scope: {
                val: '=ngModel', /* active date */
                rmConfig: "=rmConfig"
            },
            link: link
        }
    }]);


    Module.run(['$templateCache', function($templateCache) {
          $templateCache.put(
              'rm-decade.html',
              '<div class="ng-class: state; square date">' +
                  '<div ng-repeat="oDate in aDates" ng-class="{j: !isDefault && isActive.year(oDate), off: isOff(oDate)}">' +
                      '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate | date: \'yyyy\'}}</span></a>' +
                  '</div>' +
              '</div>'
          );

          $templateCache.put(
              'rm-year.html',
              '<div class="ng-class: state; square date">' +
                  '<div ng-repeat="oDate in aDates" ng-class="{j: !isDefault && isActive.month(oDate), off: isOff(oDate)}">' +
                      '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate | date: \'LLLL\'}}</span></a>' +
                  '</div>' +
              '</div>'
          );

          $templateCache.put(
              'rm-month.html',
              '<div class="day sunSat">' +
                  '<a ng-repeat="oDate in aDates | limitTo:7">{{oDate | date: \'EEE\'}}</a>' +
              '</div>' +
              '<div class="ng-class: state; square date">' +
                  '<div ng-repeat="oDate in aDates" ng-class="{j: !isDefault && isActive.date(oDate), off: isOff(oDate), out: !isActive.month(oDate)}">' +
                      '<a ng-click="go(oDate)" class="waves-effect"><span>{{oDate.getDate()}}</span></a>' +
                  '</div>' +
              '</div>'
          );
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
