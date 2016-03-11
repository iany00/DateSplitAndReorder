(function (w) {
    var Confirm = {
        ready     : false,
        heading   : 'Are you sure?',
        okText    : 'OK',
        cancelText: 'Cancel',
        show      : function (ok, cancel) {

            if (!this.ready) {
                this.build();
            }

            this._show(ok, cancel);
            $(".confirmMessage").css("z-index","10001");

            return this;
        },
        hide      : function () {
            if (this.ready) {
                this.div.modal('hide');
            }
        },
        setContent : function (content) {
            this.modalBody.find('#modal-content').empty();
            if(content)
            {
                this.modalBody.find('#modal-content').html(content);
            }

        },
        build     : function () {

            var padding = this.getPadding();

            this.div = $('<div>').addClass('modal fade confirmMessage').attr('tabindex', '-1').css("z-index","10001");    // tabindex=-1 => dismiss modal on ESC press :D
            this.dialog = $('<div>').addClass('modal-dialog').css('margin-top', padding);
            this.dialogContent = $('<div>').addClass('modal-content');
            this.dialogContent.append($('<div>').addClass('modal-header').html('<h4 class="modal-title">' + this.heading + '</h4>'));

            // confirm buttons
            this.okBtn = $('<button></button>', {type: 'button'}).addClass('btn btn-success').text(this.okText).css({
                'margin-left': '10px',
                'width': '70px'
            });
            this.cancelBtn = $('<button></button>', {type: 'button'}).addClass('btn btn-danger').text(this.cancelText).css({
                'width': '70px'
            });

            // body 
            this.modalBody = $('<div>').addClass('modal-body');
            var well = $('<div style="margin-top: 20px"></div>').addClass('text-center');
            var content = $('<div></div>').addClass('text-center').attr('id', 'modal-content');
            this.modalBody.append(content);
            this.modalBody.append(well);
            well.append(this.cancelBtn);
            well.append(this.okBtn);
            this.dialogContent.append(this.modalBody);
            this.dialogContent.appendTo(this.dialog);
            this.dialog.appendTo(this.div);
            this.div.appendTo($('body'));


            // ready
            this.ready = true;
        },
        _show     : function (ok, cancel) {

            // replace the callback for the OK button
            var self = this;
            this.okBtn.off('click');
            this.okBtn.on('click', function () {
                if (typeof(ok) == 'function') {
                    ok.call(this);
                }

                self.div.modal('hide');
            });

            this.cancelBtn.off('click');
            this.cancelBtn.on('click', function () {
                if (typeof(cancel) == 'function') {
                    cancel.call(this);
                }
                self.div.modal('hide');
            });

            this.div.modal({backdrop: 'static'});
        },
        getPadding: function () {

            if (typeof( window.innerHeight ) == 'number') {

                return window.innerHeight > 500 ? 200 : 100;
            } else if (document.documentElement) {

                return document.documentElement.clientHeight > 500 ? 200 : 100;
            }

            return 150;
        },
        setHeading: function (heading) {
            this.div.find('.modal-title').html(heading || this.heading);

            return this;
        },
        setOkText: function(text) {
            this.okText = text;
        },
        setCancelText: function(text) {
            this.cancelText = text;
        }
    };

    w.Confirm = function (message, okBtn, cancelBtn, content) {
        Confirm.show(okBtn, cancelBtn).setHeading(message).setContent(content);
    };
    
    w.setConfirmOkBtnText = function (text) {
        Confirm.setOkText(text);
    };

    w.setConfirmCancelBtnText = function (text) {
        Confirm.setCancelText(text);
    }

})(window);