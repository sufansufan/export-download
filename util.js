export default {
    install(Vue) {
        Vue.prototype.Util = {
            judgeErrorCode: function(code) {
                return code === 0;
                /*if(code === 0){
                    return true
                }else{
                    return false
                }*/
            },
            //时间戳转换所需时间格式
            getDateFormat: function(timestamp) {

                if (!timestamp) {
                    return "错误的输入"
                }
                let d = new Date(parseInt(timestamp));
                let year = d.getFullYear(),
                    month = d.getMonth() + 1,
                    day = d.getDate(),
                    hours = d.getHours(),
                    minutes = d.getMinutes(),
                    seconds = d.getSeconds();

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds
                }

                return year + "-" + month + "-" + day + "--" + hours + ":" + minutes + ":" + seconds;
            },
            //时间戳转换所需时间格式
            getDateFormat2: function(timestamp) {
                if (!timestamp) {
                    return "错误的输入"
                }
                let d = new Date(parseInt(timestamp));
                let year = d.getFullYear(),
                    month = d.getMonth() + 1,
                    day = d.getDate(),
                    hours = d.getHours(),
                    minutes = d.getMinutes(),
                    seconds = d.getSeconds();

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds
                }

                return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            },
            /**
             * 时间格式转换
             * @param timestamp
             * @param type  第二个参数为ymd时,返回年月日,为hms时,返回时分秒.不传参时返回年月日时分秒
             * @returns {*}
             * @constructor
             */
            TimeCycle: function(timestamp, type) {
                if (!timestamp || !/^\d+$/.test(timestamp)) {
                    console.warn("输入得参数不是时间戳");
                    return ""
                }
                let d = new Date(parseInt(timestamp));
                let year = d.getFullYear(),
                    month = d.getMonth() + 1,
                    day = d.getDate(),
                    hours = d.getHours(),
                    minutes = d.getMinutes(),
                    seconds = d.getSeconds();
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds
                }
                if (type === "ymd") {
                    return year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
                } else if (type === "ym") {
                    return year + "-" + (month < 10 ? "0" + month : month);
                } else if (type === 'md') {
                    return month + "月" + day + "日";
                } else if (type === "hms") {
                    return hours + ":" + minutes + ":" + seconds;
                } else if (type === "hm") {
                    return hours + ":" + minutes;
                } else {
                    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                }
            },
            // 导出excel
            exportExcel(data, title) {
                if (!data) return;
                let url = window.URL.createObjectURL(new Blob([data]));
                let link = document.createElement('a')
                link.style.display = 'none'
                link.href = url
                link.setAttribute('download', title + this.TimeCycle(new Date().getTime()) + '.xlsx')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            },
            /**
             * 计算上课时间长度
             * @param startT "08:00"
             * @param endT  "10:00"
             */
            getSpendhours: function(startT, endT) {
                let startArr = startT.split(":");
                let endArr = endT.split(":");
                console.log(startArr, endArr);
                return (parseInt(endArr[0]) - parseInt(startArr[0])) * 60 + (parseInt(endArr[1]) - parseInt(startArr[1]))
            },
            /**
             * 此函数为转换导航栏得结构
             * 功能:在前端可以把你给得区域导航列表重构,且可以动态配置到第几层.
             * 用途:在选择区域导航时,可以动态控制向用户展示几层区域导航.
             * @param child //child为导航栏得原结构,json格式, 之前被JSON.parse(navStr)处理过
             * @param num 到第几层
             * @returns {*}
             * @constructor
             */
            NavReconsitution: function(child, num) {
                let arr = [];
                if (child && child.length) {
                    if (num === undefined) {
                        num = -1;
                    }
                    num--;
                    for (let i = 0; i < child.length; i++) {
                        let obj = {};
                        obj.value = child[i].value;
                        obj.label = child[i].label;
                        obj.type = child[i].type;
                        let child2 = child[i].children ? child[i].children : [];
                        if (num !== 0) {
                            let arr2 = this.NavReconsitution(child2, num);
                            if (arr2 !== null) {
                                obj.children = [];
                                obj.children = arr2;
                            }
                        }
                        arr.push(obj);
                    }
                } else {
                    return null;
                }
                return arr;
            },
            /*    queryAdminNav: function(self, num) {
                   let objData = {};
                   const _this = this
                   self.$axios.post(self.GlobalVal.httpLink.getAreaNav, JSON.stringify(objData)).then(
                       res => {
                           if (res.data.code === "10000") {
                               console.log(res.data.areaNav, 999999);
                               self.$store.commit("setAdminLocation", res.data.areaNav);
                               console.log()
                               window.sessionStorage.setItem("AdminNav", _this.NavReconsitution(res.data.areaNav, num));
                           } else {
                               self.$message({
                                   type: "error",
                                   message: res.data.errmsg
                               });
                           }
                       },
                       res => {
                           self.$message("请求失败");
                           self.getData();
                       }
                   )
               }, */
            /**
             * 查询区域导航列表
             * @param self
             * @param num
             * @example this.Util.queryAreaNav(self);
             */
            queryAreaNav: function(self, num, callBack) {
                const _this = this;
                let staffOrganId = JSON.parse(window.sessionStorage.getItem("staff")).staffOrganId;
                let location = _this.NavReconsitution(JSON.parse(window.sessionStorage.getItem("areaNav")), num);
                sessionStorage.setItem('areaNavParentId', null);
                let setLocation = (data, oId, parent) => {
                    if (oId === 1) return data;
                    return data && data.map((item, index) => {
                        if (item.value !== oId) {
                            item.children && setLocation(item.children, oId, [data, index]);
                        } else {
                            data.forEach(item => {
                                if (item.value !== oId) {
                                    item.type !== 3 && (item.disabled = true);
                                } else {
                                    item.type === 2 && sessionStorage.setItem('areaNavParentId', item.value);
                                }
                            })
                            setLocation(location, parent[0][parent[1]].value);
                        }
                        return item;
                    })
                }
                if (window.sessionStorage.getItem("areaNav")) { //已经加载过一次区域导航了
                    self.$store.commit("setLocation", setLocation(location, staffOrganId));
                    self.$store.commit("setOrganId", self.$store.state.location[0].value);
                    callBack();
                } else { //没有加载过区域导航
                    let objData = {
                        staffId: JSON.parse(window.sessionStorage.getItem("staff")).staffId,
                    };
                    self.$axios.post(self.GlobalVal.httpLink.getAreaNav, JSON.stringify(objData)).then(
                        res => {
                            if (res.data.code === "10000") {
                                console.log(res.data.areaNav);
                                location = _this.NavReconsitution(res.data.areaNav, num);
                                self.$store.commit("setLocation", setLocation(location, staffOrganId));
                                self.$store.commit("setOrganId", self.$store.state.location[0].value);
                                window.sessionStorage.setItem("areaNav", JSON.stringify(res.data.areaNav));
                            } else {
                                self.$message({
                                    type: "error",
                                    message: res.data.errmsg
                                });
                            }
                            callBack();
                        },
                        res => {
                            self.$message("请求失败");
                            self.getData();
                        }
                    )
                    let objAdmin = {};
                    self.$axios.post(self.GlobalVal.httpLink.getAreaNav, JSON.stringify(objAdmin)).then(
                        res => {
                            if (res.data.code === "10000") {
                                console.log(res.data.areaNav);
                                self.$store.commit("setAdminLocation", setLocation(_this.NavReconsitution(res.data.areaNav, num), staffOrganId))
                            } else {
                                self.$message({
                                    type: "error",
                                    message: res.data.errmsg
                                });
                            }
                            callBack();
                        },
                        res => {
                            self.$message("请求失败");
                            self.getData();
                        }
                    )
                }
                let objData = {
                    staffId: JSON.parse(window.sessionStorage.getItem("staff")).staffId,
                };
            },
            /**
             * 根据所属ID查询所属层级
             * @param location
             * @param targetId
             * @example this.Util.getCityLevel(location, targetId);
             */
            getCityLevel(location, targetId) {
                const cityLevel = [];
                (function getCityLevel(data, targetId, parent) {
                    Array.isArray(data) && data.forEach((item, index) => {
                        if (item.value !== targetId) {
                            item.children && getCityLevel(item.children, targetId, [data, index])
                        } else {
                            parent && getCityLevel(location, parent[0][parent[1]].value)
                            cityLevel.push(item.value);
                            console.log(cityLevel);
                        }
                    })
                })(location, targetId);
                return cityLevel;
            },
            getCityData(location, targetId, oldData){
                let cityData = [];
                (function getCityData(data, targetId) {
                    Array.isArray(data) && data.forEach((item, index) => {
                        if (item.value !== targetId) {
                            item.children && getCityData(item.children, targetId)
                        } else {
                            cityData = item.children
                        }
                    })
                })(location, targetId);
                (function getOldData(targetId, oldData) {
                    Array.isArray(oldData) && oldData.forEach((item, index) => {
                        if (item.value !== targetId) {
                            item.children && getOldData(targetId, item.children)
                        } else {
                            item.children = cityData
                        }
                    })
                })(targetId, oldData);
                return oldData;
            },
            queryRoles: function(self, callback) {
                let objData = {
                    staffId: JSON.parse(window.sessionStorage.getItem("staff")).staffId,
                };
                console.log("查询角色列表发起请求的参数", objData);
                self.$axios.post(self.GlobalVal.httpLink.queryRoles, JSON.stringify(objData)).then(
                    res => {
                        if (res.data.code === "10000") {
                            console.log("查询角色列表获取的对象", res.data);
                            callback(res);
                        } else {
                            self.$message({
                                type: "error",
                                message: res.data.errmsg
                            })
                        }
                    },
                    res => {
                        self.$message("请求失败")
                    }
                )
            },
            /**
             * 手机号码隐藏中间4位
             * @param phone 电话号码
             * @returns {*|XML|void|string} 隐藏后得电话号码
             */
            formatPhone: function(phone) {
                if (typeof phone === 'number') {
                    phone = phone.toString();
                }
                return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
            },
            /**
             * 编码类型管理
             * @param code
             * @returns {string}
             */
            changeCode: function(code) {
                let str = "";
                switch (code) {
                    case "10001":
                        str = "数学";
                        break;
                    case "10002":
                        str = "物理";
                        break;
                    case "10003":
                        str = "化学";
                        break;
                    case "10004":
                        str = "英语";
                        break;
                    case "10006":
                        str = "语文";
                        break;
                    case "10007":
                        str = "科学";
                        break;
                    case "10101":
                        str = "幼升小";
                        break;
                    case "10102":
                        str = "一级年";
                        break;
                    case "10103":
                        str = "二年级";
                        break;
                    case "10104":
                        str = "三年级";
                        break;
                    case "10105":
                        str = "四年级";
                        break;
                    case "10106":
                        str = "五年级";
                        break;
                    case "10107":
                        str = "六年级";
                        break;
                    case "10108":
                        str = "小升初";
                        break;
                    case "10109":
                        str = "初一";
                        break;
                    case "10110":
                        str = "初二";
                        break;
                    case "10111":
                        str = "初三";
                        break;
                    case "10112":
                        str = "初升高";
                        break;
                    case "10113":
                        str = "高一";
                        break;
                    case "10114":
                        str = "高二";
                        break;
                    case "10115":
                        str = "高三";
                        break;
                    case "10116":
                        str = "高考";
                        break;

                    case "001":
                        str = "ProjectType";
                        break;
                    case "002":
                        str = "CourseType";
                        break;
                    case "003":
                        str = "ClassType";
                        break;
                    case "006":
                        str = "Season";
                        break;
                    case "007":
                        str = "Department";
                        break;
                    case "008":
                        str = "EntryRank";
                        break;
                    case "009":
                        str = "Periods";
                        break;
                    case "010":
                        str = "OrderStatus";
                        break;
                    case "011":
                        str = "StudentStatus";
                        break;
                    case "012":
                        str = "PaymentType";
                        break;
                    case "013":
                        str = "Paystatus";
                        break;
                    case "014":
                        str = "OrderSource";
                        break;
                    case "015":
                        str = "CouponType";
                        break;
                    case "016":
                        str = "DiscountType";
                        break;
                    case "100":
                        str = "Subject";
                        break;
                    case "101":
                        str = "Grade";
                        break;
                    case "021":
                        str = "KnowChannle";
                        break;
                    case "024":
                        str = "TurnClassCondition";
                        break;
                    case "025":
                        str = "LiberalType";
                        break;
                    case "026":
                        str = "ChargeItem";
                        break;
                    default:
                        str = "未知"
                }
                return str;
            },
            /**
             * 根据value得值查找label得值
             * @param arr 数组
             * @param val 字符串
             * @returns {*}
             * @constructor
             * @example d.paymentComputed = self.Util.GetLabelForValue(self.$store.state.PaymentTypeOptions,d.payment);
             */
            GetLabelForValue: function(arr, val) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据value得值查找label得值得函数中,输入得数组为空数组");
                    return "未知"
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i].value === val) {
                        return arr[i].label;
                    }
                }
                return "";
            },
            /**
             * 根据label得值查找value得值
             * @param arr 数组
             * @param val 字符串
             * @returns {*}
             * @constructor
             * @example d.paymentComputed = self.Util.GetLabelForValue(self.$store.state.PaymentTypeOptions,d.payment);
             */
            GetValueForLabel: function(arr, val) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据value得值查找label得值得函数中,输入得数组为空数组");
                    return "未知"
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i].label === val) {
                        return arr[i].value;
                    }
                }
                return "未找到"
            },
            /*
             * 根据date_slot_id得值查找到date_slot_name得值
             * @param arr 时间安排规律对应的数组
             * @param val 字符串
             * @returns {*}
             * @constructor
             * @example o.date_name = self.Util.GetNameForValue(this.dateSlots,o.date_id);
             * */
            GetNameForValue: function(arr, val) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据value得值查找label得值得函数中,输入得数组为空数组");
                    return "未知"
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i].date_slot_id === val) {
                        return arr[i].date_slot_name;
                    }
                }
                return "未找到"
            },
            /*
             * 根据time_slot_id得值查找到time_slot_name得值
             * @param arr 时间段对应的数组
             * @param val 字符串
             * @returns {*}
             * @constructor
             * @example o.date_name = self.Util.GetTimeNameForValue(this.dateSlots,o.date_id);
             * */
            GetTimeNameForValue: function(arr, val) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据value得值查找label得值得函数中,输入得数组为空数组");
                    return "未知"
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i].time_slot_id === val) {
                        return arr[i].time_slot_name;
                    }
                }
                return "未找到"
            },
            /*
             * 根据id得值查找到name得值
             * @param arr 时间段对应的数组
             * @param val 字符串
             * @param seaval 搜索的值
             * @returns {*}
             * @constructor
             * @example o.name = self.Util.GetIdNameForValue(this.dateSlots,o.id,seaid,seaname);
             * */
            GetIdNameForValue: function(arr, val, seaid, seaname) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据id得值查找name得值得函数中,输入得数组为空数组");
                    return "";
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i][seaid] === val) {
                        return arr[i][seaname];
                    }
                }
                return "";
            },
            GetClassNameForValue: function(arr, val) {
                if (val === undefined) {
                    console.error("GetLabelForValue func error: no 'val' in put");
                    return
                }
                if (arr === undefined) {
                    console.error("GetLabelForValue func error: no 'arr' in put");
                    return
                }
                if (!Array.isArray(arr)) {
                    console.error("GetLabelForValue func error: 'obj' not Array type");
                    return
                }
                if (arr.length === 0) {
                    console.log("根据value得值查找label得值得函数中,输入得数组为空数组");
                    return "未知"
                }
                for (let i = 0, length = arr.length; i < length; i++) {
                    if (arr[i].croom_id === val) {
                        return arr[i].croom_name;
                    }
                }
                return "未找到"
            },
            /**
             * 查询常量信息
             * @param self 环境上下文
             * @param val 判断要查询哪个变量
             * @param obj  判断是否已经有值了,避免重复查询
             */
            querySysconst(self, val, obj) {
                let arr = [];
                if (val === undefined) {
                    console.error("query sysconst error: no 'val' in put");
                    return
                }
                if (obj === undefined) {
                    console.error("query sysconst error: no 'obj' in put");
                    return
                }
                if (!Array.isArray(obj)) {
                    console.error("query sysconst error: 'obj' not Array type");
                    return
                }
                let objData = {
                    staffId: JSON.parse(window.sessionStorage.getItem("staff")).staffId,
                    type: this.changeCode(val)
                };
                if (obj.length === 0) {
                    console.log("查询常量发起请求的参数", objData);
                    self.$axios.post(self.GlobalVal.httpLink.querySysconst, JSON.stringify(objData)).then(
                        res => {
                            if (res.data.code === "10000") {
                                console.log("查询常量获取的对象", res.data);
                                for (let i = 0, length = res.data.sysconsts.length; i < length; i++) {
                                    arr.push({
                                        value: res.data.sysconsts[i].code,
                                        label: res.data.sysconsts[i].value,
                                        id: res.data.sysconsts[i].id,
                                        remark: res.data.sysconsts[i].remark,
                                        type: res.data.sysconsts[i].type,
                                    })
                                }
                                assignment(arr);
                            } else {
                                console.error(res);
                                self.$message({
                                    type: "error",
                                    message: res.data.errmsg
                                })
                            }
                        },
                        res => {
                            self.$message("请求失败")
                        }
                    )
                }
                /**
                 * 开始赋值回调
                 * @param arr
                 */
                function assignment(arr) {
                    switch (val) {
                        case "001":
                            self.$store.commit("setProjectTypeOptions", arr);
                            break;
                        case "002":
                            self.$store.commit("setCourseTypeOptions", arr);
                            break;
                        case "003":
                            self.$store.commit("setClassTypeOptions", arr);
                            break;
                        case "006":
                            self.$store.commit("setSeasonOptions", arr);
                            break;
                        case "007":
                            self.$store.commit("setDepartmentOptions", arr);
                            break;
                        case "008":
                            self.$store.commit("setEntryRankOptions", arr);
                            break;
                        case "009":
                            self.$store.commit("setPeriodsOptions", arr);
                            break;
                        case "010":
                            self.$store.commit("setOrderStatusOptions", arr);
                            break;
                        case "011":
                            self.$store.commit("setStudentStatusOptions", arr);
                            break;
                        case "012":
                            arr = arr.filter(item => (item.label !== '微信' && item.label !== '支付宝' && item.label !== '银行卡'));
                            self.$store.commit("setPaymentTypeOptions", arr);
                            break;
                        case "013":
                            self.$store.commit("setPaystatusOptions", arr);
                            break;
                        case "014":
                            self.$store.commit("setOrderSourceOptions", arr);
                            break;
                        case "015":
                            self.$store.commit("setCouponTypeOptions", arr);
                            break;
                        case "016":
                            self.$store.commit("setDiscountTypeOptions", arr);
                            break;
                        case "100":
                            self.$store.commit("setSubjectOptions", arr);
                            break;
                        case "101":
                            self.$store.commit("setGradeOptions", arr);
                            break;
                        case "021":
                            self.$store.commit("setKnowChannleOptions", arr);
                            break;
                        case "025":
                            self.$store.commit("setLiberalTypeOptions", arr);
                            break;
                        case "024":
                            self.$store.commit("setTurnClassConditionOptions", arr);
                            break;
                        case "026":
                            self.$store.commit("setChargeItemOptions", arr);
                            break;
                    }
                }
            },

            /**
             * 自动转换为浮点类的数
             * @param val
             */
            parseFloatRule(val) {
                return parseFloat(val.match(/\d+.+/)[0]);
            },
            /**
             * 自动转换为整形的数
             * @param val
             */
            parseIntRule(val) {
                return parseInt(val.match(/\d+.+/)[0]);
            },

        }
    }
}