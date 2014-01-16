﻿/// <reference path="../mock/data.js" />
/// <reference path="../../lib/knockout-2.2.0.js" />
/// <reference path="../staticdata.js" />
(function (IMS, $, undefined) {
    IMS.NewAppointmentViewModel = function () {
        var self = this;

        self.carInformation = {
            validationMsg: ko.observable(''),
            driver: ko.observable(),
            mobile: ko.observable(),
            vehicleType: ko.observable(),
            vehicleLicenseNumber: ko.observable(),
            vehicleAbbrev: ko.observable(),
            vehicleTypeOptions: IMS.staticData.carTypes,
            provincesOptions: IMS.staticData.provinceAbbreviation,
            //the next step click action
            nextStepToAddDeliverOrderPage: function () {
                if (self.validation()) {
                    $.mobile.changePage("#theSecondStepView");
                }
                else {
                    $("#validationMsg").popup();
                    $("#validationMsg").popup('open');
                }
            }

        };

        self.validation = function () {
            var message = '';
            var result = true;
            if (self.carInformation.driver() == undefined || self.carInformation.driver() == '') {
                message = '<li>请输入驾驶员信息;</li>'
                result = false;
            }

            if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(self.carInformation.mobile()))) {

                message += '<li>请输入正确的手机号码;</li>'
                result = false;
            }

            if (self.carInformation.vehicleLicenseNumber() == undefined || self.carInformation.vehicleLicenseNumber() == '') {
                message += '<li>请输入车牌号;</li>'
                result = false;
            }
            self.carInformation.validationMsg(message);
            return result;
        }


        self.carInformation.vehicleLicense = ko.computed(function () {
            return self.carInformation.vehicleAbbrev() + self.carInformation.vehicleLicenseNumber();
        }, self.carInformation);


        self.deliveryOrderInformation = {
            validationMsgOfDelivery: ko.observable(''),
            vendorCode: ko.observable(),
            deliveryNoteIdToAdd: ko.observable(),
            deliveryNoteId: ko.observableArray([])
        };
        self.deliveryOrderInformation.deliveryNoteCount = ko.observable(0);

        var validationDeliveryItem = function () {
            var itemToAdd = self.deliveryOrderInformation.deliveryNoteIdToAdd();
            if (itemToAdd == undefined) {
                self.deliveryOrderInformation.validationMsgOfDelivery('请输入交货单号码！')
                $('#validationMsgOfDelivery').popup('open');
                return false;
            } else {
                if (ko.utils.arrayIndexOf(self.deliveryOrderInformation.deliveryNoteId(), itemToAdd) != -1) {
                    self.deliveryOrderInformation.validationMsgOfDelivery('你输入的单号已经存在！')
                    $('#validationMsgOfDelivery').popup('open');
                    return false;
                }
            }
            return true;
        };
        //add one deliveryNote to the list
        self.deliveryOrderInformation.addOneDeliveryNoteId = function () {
            if (validationDeliveryItem()) {
                self.deliveryOrderInformation.deliveryNoteId.push(self.deliveryOrderInformation.deliveryNoteIdToAdd());
                self.deliveryOrderInformation.deliveryNoteCount(self.deliveryOrderInformation.deliveryNoteId().length);
            }
        };

        //remove one deliveryNote from the list
        self.deliveryOrderInformation.removeOneDeliveryId = function (note) {
            self.deliveryOrderInformation.deliveryNoteId.remove(note);
        };

        self.goBackToCarInformationPage = function () {
            $.mobile.changePage("#theFirstStepView");
        };

        var finalValidation = function () {
            if (self.deliveryOrderInformation.vendorCode() == undefined || self.deliveryOrderInformation.vendorCode() == '') {
                self.deliveryOrderInformation.validationMsgOfDelivery('供应商代码不可以为空！')
                $('#validationMsgOfDelivery').popup('open');
                return false;
            }
            if (self.deliveryOrderInformation.deliveryNoteCount() == 0) {
                self.deliveryOrderInformation.validationMsgOfDelivery('请至少输入一条交货单！')
                $('#validationMsgOfDelivery').popup('open');
                return false;
            }
            return true;
        }

        self.nextStepToSubmitPage = function () {
            if (finalValidation())
                $.mobile.changePage("#theThirdStepView");
        };

        self.goBackToDeliveryOrderInformation = function () {
            $.mobile.changePage("#theSecondStepView");
        };

        var getCurrentformatedDateString = function (withTime) {
            var date = new Date();
            if (withTime) {
                date.setHours(23, 59, 59);
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            }
            return moment(date).format("YYYY-MM-DD");
        },
         getCurrentformatedTimeString = function () {
             var date = new Date();
             date.setHours(23, 59, 59);
             return moment(date).format("HH:mm:ss");

         }
        self.pDate = ko.observable(getCurrentformatedDateString(false));
        self.pETime = ko.observable(getCurrentformatedTimeString());
        self.pLTime = ko.observable(getCurrentformatedTimeString());

        var pETime = self.pDate() + " " + self.pETime() + ":00";
        var pLTime = self.pDate() + " " + self.pLTime() + ":00";
        self.sucessfullAppointmentId = ko.observable();
        self.submit = function () {
            var option = {
                key: IMS.util.getUserInfo().key,
                driver: encodeURI(self.carInformation.driver()),
                mobile: self.carInformation.mobile(),
                vendorCode: self.deliveryOrderInformation.vendorCode(),
                vehicleType: encodeURI(self.carInformation.vehicleType()),
                vehicleLicense: encodeURI(self.carInformation.vehicleLicense()),
                pDate: getCurrentformatedDateString(false),
                pETime: pETime,
                pLTime: pLTime,
                deliveryNoteId: self.deliveryOrderInformation.deliveryNoteId()
            };
            IMS.datacontext.appointment.createNewAppointment(option).then(function (result) {
                if (result.errorMessage !== '') {
                    $.mobile.changePage("#resultView");
                    self.sucessfullAppointmentId(result.errorMessage);
                }
            }, function () {
                $("#popupMessage").popup();
                $("#popupMessage").popup("open");
            });
        };


    }
    return IMS.NewAppointmentViewModel;
})(window.IMS = window.IMS || {}, jQuery);

