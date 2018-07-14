import Vue from "vue";
import Progress from "../progress.vue";


const showProgress = Vue.extend(Progress);

const exportExcel = params => {
    let flag = false;
    const oDiv = document.createElement("div");
    const defaultParams = {
        dataList: [], // 必传
        httpUrl: "", // 必传
        objData: {}, // 必传
        title: "" // 可选
    };
    return function (params) {
        params = Object.assign({}, defaultParams, params);
        const {
            dataList,
            httpUrl,
            objData,
            title
        } = params;
        const progress = new showProgress({
            el: flag ? ".progress" : oDiv,
            data() {
                return {
                    progress: {
                        show: false,
                        num: 0
                    } // 下载进度
                };
            },
            mounted() {
                if (!dataList.length) {
                    this.$message.warning("未查询出数据，无法导出");
                    return false;
                }
                let dateLength = new Date().getTime();
                let dataLink = this.GlobalVal.httpLink[httpUrl]+ '?'; ///pxxmanage/home/eduadmin/export/exportOrder?this.GlobalVal.httpLink[httpUrl]/pxxmanage/home/eduadmin/export/exportClassForBackstage?
                for (let i in objData) {
                    objData[i] &&
                        i !== "page" &&
                        i !== "limit" &&
                        (dataLink += i + "=" + objData[i] + "&");
                }
                let loading = this.$Loading("导出中，请稍后...",6000000000);          
                this.progress.show = true;
                var source = new EventSource(this.GlobalVal.httpLink.exportLength + '?length=length_'+httpUrl+'&nowLength=nowLength_'+httpUrl+'&dateLength='+ dateLength + '&staffId=' + JSON.parse(window.sessionStorage.getItem("staff")).staffId);
                source.onmessage = (e) => {
                    let dataLength = JSON.parse(e.data)
                    console.log(dataLength);
                    /* if (dataLength.length === dataLength.nowLength && dataLength.length != 0) {
                        source.close();
                    } */
                    progress.num = dataLength.nowLength / dataLength.length * 100 | 0;
                };
                this.$axios({
                        method: "get",
                        url: dataLink +"dateLength="+dateLength+"&",
                        responseType: "blob",
                    })
                    .then(res => {
                        this.progress.show = false;
                        this.$el.style.display = "none";
                        source.close();
                        loading.close();
                        console.log(res.config.data,99999)
                        console.log(res,88888888)
                        /* if(res.config.data === undefined){
                            this.$message.error('导出人数过多!请稍后在试');
                            source.close();
                            return;
                        } */
                        this.Util.exportExcel(res.data, title);
                    })
                    .catch(error => {
                        console.log(error)
                        loading.close();
                        this.$el.style.display = "none";
                        this.progress.show = false;

                    });
            }
        });
        if (!flag) {
            document.body.appendChild(progress.$el);
            flag = true;
        }
    };
};

const regExportExcel = () => {
    Vue.prototype.$exportExcel = exportExcel();
};

export default regExportExcel;