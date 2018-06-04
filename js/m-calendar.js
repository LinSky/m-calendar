

function MCalendar (options) {
    /**
    *默认参数
    **/
    var defaultOpts = {
        currentDate: '2018-04-01'
    }

    /**
    *参数合并
    **/
    this.opts = Object.assign({}, defaultOpts, options)
    this.el = document.getElementById(this.opts.el)
    this.events = null
    this.start = {}
    this.end = {}
    this.pos = {}
    this.direction = null
    this.current = 1
    this.changeDate = null
    this.isChanged = false

    /**
    *初始化
    **/
    this.init()
    console.log($);

}

MCalendar.prototype = {
    init () {
        const eventNames = ['touchstart', 'touchmove', 'touchend'];
        eventNames.map(eventName => {
            this.el.addEventListener(eventName, this[eventName].bind(this), false);
        });

        var initHtml = ''
        this.changeDate = this.getBuildDate(this.opts.currentDate, 0)

        for (var i = -1; i < 2; i++) {
            initHtml += this.buildSliderHtml(this.getBuildDate(this.opts.currentDate, i))
        }
        this.el.innerHTML = initHtml


    },

    getBuildDate (date, index) {//index = 0 当前月，-1上月， 1下月
        var dateArr = date.split('-'),
            year = dateArr[0],
            month = dateArr[1]
        if (index === -1) {
            if (month === '01') {
                month = '12'
                year = Number(year) - 1
            }else {
                month = this.repairZero(Number(month) - 1)
            }
        } else if (index === 1) {
            if (month === '12') {
                month = '01'
                year = Number(year) + 1
            }else {
                month = this.repairZero(Number(month) + 1)
            }
        }

        return year + '-' + month + '-' + '01'
    },

    repairZero (num) {
        return num < 10 ? '0' + num : num;
    },

    /*******************************************
    ==计算滑动角度
    *******************************************/
    getAngle (x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },

    /*******************************************
    ==判断是左滑还是右滑
    *******************************************/
    getTouchDir (posx, posy) {
        var angle = this.getAngle(posx, posy);
        if (angle >= -45 && angle <= 45) {
            //向右
            this.direction = 'right';
        } else if (angle >= 135 && angle <= 180 || angle >= -180 && angle < -135) {
            //向左
            this.direction = 'left';
        } else if (angle >= -135 && angle <= -45) {
            //向上
            this.direction = 'top';
        } else if (angle > 45 && angle < 135) {
            //向下
            this.direction = 'bottom';
        }
    },


    /*******************************************
    ==touchstart事件处理程序
    *******************************************/
    touchstart (e) {
        var touches = e.touches[0];
        this.start.x = touches.pageX;
        this.start.y = touches.pageY;
    },

    /*******************************************
    ==touchmove事件处理程序
    *******************************************/
    touchmove (e) {
        var touches = e.touches[0];
        this.end.x = touches.pageX;
        this.end.y = touches.pageY;
        this.pos.width = this.end.x - this.start.x;
        this.pos.height = this.end.y - this.start.y;
        this.el.children[this.current].style.cssText = '-webkit-transform: translateY('+ this.pos.height +'px); transform: translateY('+ this.pos.height +'px);'
    },

    /*******************************************
    ==touchend事件处理程序
    *******************************************/
    touchend (e) {
        var touches = e.changedTouches[0];
        this.end.x = touches.pageX;
        this.end.y = touches.pageY;
        this.pos.width = this.end.x - this.start.x;
        this.pos.height = this.end.y - this.start.y;
        this.getTouchDir(this.pos.width, this.pos.height)
        console.log(this.direction)
        var currentEl = this.el.querySelector('.current'),
            prevEl =  this.el.querySelector('.prev'),
            nextEl = this.el.querySelector('.current')

        if (Math.abs(this.pos.height) > 50) {
            if (this.direction === 'top') {
                this.el.children[this.current].style.cssText = '-webkit-transform: translateY(-100%); transform: translateY(-100%);'
                this.el.children[this.current + 1].style.cssText = '-webkit-transform: translateY(0); transform: translateY(0);'

                this.changeDate = this.getBuildDate(this.getBuildDate(this.changeDate, 1), 1)

                this.el.appendChild(this.parseDom(this.buildSliderHtml(this.changeDate))[0])
                this.el.removeChild(this.el.children[0])
                this.changeDate = this.getBuildDate(this.changeDate, -1)

            }else if(this.direction === 'bottom') {

                this.el.children[this.current].style.cssText = '-webkit-transform: translateY(100%); transform: translateY(100%);'
                this.el.children[this.current-1].style.cssText = '-webkit-transform: translateY(0); transform: translateY(0);'

                this.changeDate = this.getBuildDate(this.getBuildDate(this.changeDate, -1), -1)


                this.el.insertBefore(this.parseDom(this.buildSliderHtml(this.changeDate))[0], this.el.children[0]);
                this.el.removeChild(this.el.children[this.el.children.length - 1])
                this.changeDate = this.getBuildDate(this.changeDate, 1)

            }
            this.isChanged = true
        } else {
            this.el.children[this.current].style.webkitTransform = '-webkit-transform: translateY(0); transform: translateY(0);'
        }

        this.direction = null
    },


    getWeeksDates (date) {
        var _this = this,
            now = new Date (),
            current = new Date (date),
            startDate = _this.getStartDate(current),
            startWeekDay = startDate.getDay()

        _this.getEvents(date)
        startDate.setDate(startDate.getDate() - startWeekDay)
        var calendar = []
        for (var i = 0; i < 6; i++) {
            var week = []
            for (var k = 0; k < 7; k++) {
                week.push({
                    theDay: startDate.getDate(),
                    isToday: now.toDateString() == startDate.toDateString(),
                    isCurMonth: startDate.getMonth() == current.getMonth(),
                    weekDay: k,
                    date: new Date(startDate),
                    event: _this.filterEventByDate(startDate)
                })
                startDate.setDate(startDate.getDate() + 1)
            }
            calendar.push(week)
        }
        return calendar
    },

    buildSliderHtml (date) {
        var _this = this,
            html = '<div class="slider_item"><div class="month">'+ date.substr(0, 7) +'</div><div class="weeks"><div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div></div><div class="days">',
            calendar = _this.getWeeksDates(date)


        for (var i = 0; i < calendar.length; i++) {
            for (var d = 0; d < calendar[i].length; d++) {
                var city = '', eventStr = ''
                if (calendar[i][d].event) {
                    city = '<div class="city">'+ calendar[i][d].event.city +'</div>'
                    eventStr = '<div class="event_num"><strong>'+ calendar[i][d].event.num +'</strong><br>事件</div>'
                }

                var noCurrentCls = calendar[i][d].isCurMonth ? '' : 'no_current_month'
                var todayCls = calendar[i][d].isToday ? 'today' : ''

                html += '<div class="day '+ noCurrentCls + ' ' + todayCls +'"><div class="date">'+ calendar[i][d].theDay +'</div>'+ city + eventStr +'</div>'
            }
        }
        html += '</div><div class="next_month">'+ this.getBuildDate(date, 1).substr(0, 7) +'</div></div>'
        return html
    },

    getEvents (date) {
        var _this = this
        if (this.opts.url) {
            $.ajax({
				type: 'post',
				dataType: 'json',
				url: _this.opts.url,
                async: false,
				data: {date: date},
				success: function (data) {
                    _this.events = data.data[_this.opts.eventsKey]
				}
			})
        }
        // this.events = [
        //     {
        //         city: '成都',
        //         date: '2018-05-08',
        //         num: 2
        //     },
        //     {
        //         city: '重庆',
        //         date: '2018-05-09',
        //         num: 1
        //     }
        // ]
    },

    filterEventByDate (date) {
        var dayEvent = null
        if (this.events) {
            for (var i = 0; i < this.events.length; i++) {
                var theDate = new Date(this.events[i].date)
                if (date.toDateString() == theDate.toDateString()) {
                    dayEvent = this.events[i]
                    break
                }
            }
        }
        return dayEvent
    },


    parseDom (html) {
    　　 var objE = document.createElement("div")
    　　 objE.innerHTML = html
    　　 return objE.childNodes
    },

    getStartDate (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1)
    }
}
