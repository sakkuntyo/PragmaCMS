/*
 *  fmgCMS
 *  Copyright 2011 PragmaCraft LLC.
 *
 *  All rights reserved.
 */

//page inits--------------------------------------------------------------------

//on pages ready
function pagesReady(){
    //add page
    $("#addPageDialog").dialog({
        //height: 'auto',
        width: 400,
        autoOpen: false,
        modal: true,
        buttons: [{
            'class': 'btn btn-primary',
            text: messages["ok"][locale],
            click: addPage
        },{
            'class': 'btn',
            text: messages["cancel"][locale],
            click: function() {
                $(this).dialog("close");
            }
        }]
    });

    //if this page is opened with addPage param, open add page dialog
    if(window.location.href.indexOf("addPage")>0){
        $("#addPageDialog").find("[name=path]").val(getParameterByName("addPage"));
        $('#addPageDialog').dialog('open');
    }
}

//on edit page ready
function editPageReady(){
    //upload attachment (modal)
    $("#uploadAttachmentDialog").dialog({
        //height: 'auto',
        width: 400,
        autoOpen: false,
        modal: true,
        buttons: [{
            'class': 'btn btn-primary',
            text: messages["upload"][locale],
            click: uploadAttachment
        },{
            'class': 'btn',
            text: messages["cancel"][locale],
            click: function() {
                $(this).dialog("close");
            }
        }]
    });

    //edit path (modal)
    $("#renamePageDialog").dialog({
        //height: 'auto',
        width: 400,
        autoOpen: false,
        modal: true,
        buttons: [{
            'class': 'btn btn-primary',
            text: messages["save"][locale],
            click: renamePage
        },{
            'class': 'btn',
            text: messages["cancel"][locale],
            click: function() {
                $(this).dialog("close");
            }
        }]
    });

    //edit html (modal)
    $("#editHtmlDialog").dialog({
        //height: 'auto',
        width: 600,
        autoOpen: false,
        modal: true,
        buttons: [{
            'class': 'btn',
            text: messages["ok"][locale],
            click: function() {
                $(this).dialog("close");
            }
        }]
    });
}

//list pages actions------------------------------------------------------------

//add page
function addPage(){
    var page =$("#addPageForm").serializeObject() ;
    $.ajax({
        url: 'addPage',
        data: page,
        dataType: 'json',
        type: 'POST',
        success: function(response) {
            if (response.status != "0") {
                showErrorDialog(response.message);
            } else {
                location.href = 'editPage?path='+response.object.path;
            }
        }
    });
}

//remove page
function removePage(pageId, goback){
    if(!confirm(messages["confirm_remove_page"][locale])) return;

    $.ajax({
        url: 'removePage',
        data: 'pageId='+pageId,
        dataType: 'json',
        type: 'POST',
        success: function(response) {
            if (response.status != "0") {
                showErrorDialog(response.message);
            } else {
                //we're in edit page mode, go back to page list
                if (goback) location.href = 'pages';

                //hide the page row
                $("#page-"+pageId).css({
                    "background-color" : "#fbcdcd"
                }, 'fast').fadeOut("fast");
            }
        }
    });
}

//edit page actions-------------------------------------------------------------

//save page properties
function renamePage(){
    var page =$("#renamePageForm").serializeObject() ;
    $.ajax({
        url: 'renamePage',
        data: page,
        dataType: 'json',
        type: 'POST',
        success: function(response) {
            if (response.status != "0") {
                showErrorDialog(response.message);
            } else {
                //TODO: shall we reload page? all paths should be updated
                $('#renamePageDialog').dialog('close');
                showStatusDialog(response.message);
            }
        }
    });
}

//save the selected page attribute
function savePageAttribute(){
    var attributeId = $("#selectedAttributeId").val();
    if (attributeId=='') return;

    var attribute = new Object();
    attribute.id = attributeId;
    attribute.value= $("#attribute-"+attributeId).val();

    $.ajax({
        url: 'savePageAttribute',
        data: attribute,
        dataType: 'json',
        type: 'POST',
        success: function(response) {
            location.reload();
        }
    });
}

//remove the selected page attribute
function removePageAttribute(){
    var attributeId = $("#selectedAttributeId").val();
    if (attributeId=='') return;

    if(!confirm('You will delete this version of the attribute, are you sure?')) return;

    $.ajax({
        url: 'removePageAttribute',
        data: 'id='+attributeId,
        dataType: 'json',
        type: 'POST',
        success: function(response) {
            location.reload();
        }
    });
}

//display selected attribute textarea
function onSelectedAttributeChange(){
    var attributeId = $("#selectedAttributeId").val();
    if (attributeId=='') return;

    //show the current attribute textarea
    $(".attribute").hide();
    $("#attribute-" + attributeId).show();

    //focus to the selected editable
    var editable = $("#pagePreview").contents().find("#attribute-editable-"+$("#id-to-attribute-"+attributeId).val());
    editable.focus();
}

//on attribute textarea value change, update preview
function onAttributeChange(attribute, id){
    var editable = $("#pagePreview").contents().find("#attribute-editable-"+attribute);
    editable.html($("#attribute-"+id).val());
    editable.focus();
}

//aloha edited content is changed, update texts
function onAlohaChange(attribute, html){
    var attributeId = $("#attribute-to-id-"+attribute).val();
    $("#attribute-"+attributeId).val(html);
}

//called when an editable is clicked
function onAlohaClick(attribute){
    var attributeId = $("#attribute-to-id-"+attribute).val();

    //show text area
    $(".attribute").hide();
    $("#attribute-"+attributeId).show();

    //make attribute selected
    $("#selectedAttributeId").find("option:selected").removeAttr("selected");
    $("#selectedAttributeId").find("option[value='"+attributeId+"']").attr("selected", "selected");
}

//called when user scrolls by mouse wheel on iframe
function onIFrameScroll(event){
    $("body").scrollTop($("body").scrollTop() - event.originalEvent.wheelDelta);
}

//called when user clicks a link in the preview iframe
function onNavigateAway(url, path){
    if (url.substring(url.length-5, url.length)=="?edit"){
        //auto size iframe
        var iframeWidth = $("#pagePreview").contents().find("body")[0].scrollWidth;
        var iframeHeight = $("#pagePreview").contents().find("body")[0].scrollHeight;

        //adjust page elems width
        $(".content").width(iframeWidth);
        $(".container").width(iframeWidth);
        $(".page-header").width(iframeWidth);

        //resize iframe to actual content
        $("#pagePreview").width(iframeWidth);
        $("#pagePreview").height(iframeHeight+30);

        return true;
    }
    //a link is clicked within iframe, reopen this page in edit mode
    location.href = "editPage?path=" + (path.substring(contextPath.length, path.length));
    return false;
}

//on page form submit
function pageFormSubmit(){
    //NOT USED
    var pageFormJson = $("#pageForm").serializeObject();
    alert(JSON.stringify(pageFormJson));
}

//upload attachment
function uploadAttachment(){
    $("#uploadAttachmentForm").submit();
}

//utility-----------------------------------------------------------------------

//fill a target with item values
function fillRecursively(targetPrefix, item){
    $.each(item, function(key, value) {
        if(typeof(value) == 'object') return  fillRecursively(targetPrefix+'-'+key, value);
        //alert (targetPrefix+key+":"+value);
        var target = $(targetPrefix+'-'+key);
        if (target.length) target.text(value); //fill if exists
    });
}

//error dialog
function showErrorDialog(message){
    var errorDialog = $('<div></div>')
    .dialog({
        autoOpen: false,
        title: messages["error"][locale],
        modal: true

    });
    errorDialog.html("<p><strong>"+message+"</strong></p>");
    errorDialog.dialog("option", "buttons", [{
        'class': 'btn',
        text: messages["ok"][locale],
        click: function() {
            $(this).dialog("close");
        }
    }]);
    errorDialog.dialog('open');
}

//status dialog
function showStatusDialog(message){
    var statusDialog = $('<div></div>')
    .dialog({
        autoOpen: false,
        title: messages["status"][locale],
        modal: true

    });
    statusDialog.html("<p><center><strong>"+message+"</strong></center></p>");
    statusDialog.dialog("option", "buttons", [{
        'class': 'btn',
        text: messages["ok"][locale],
        click: function() {
            $(this).dialog("close");
        }
    }]);
    statusDialog.dialog('open');
}

//serialize jquery objects to json
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

//get param from query string
function getParameterByName(name){
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

//I18N messages-----------------------------------------------------------------
var messages = {
    "error": {
        en: "Error",
        tr: "Hata"
    },
    "status": {
        en: "Status",
        tr: "Durum"
    },
    "upload": {
        en: "Upload",
        tr: "Yükle"
    },
    "cancel": {
        en: "Cancel",
        tr: "İptal"
    },
    "ok": {
        en: "OK",
        tr: "Tamam"
    },
    "save": {
        en: "Save",
        tr: "Kaydet"
    },
    "remove": {
        en: "Remove",
        tr: "Kaldır"
    },
    "select": {
        en: "Select",
        tr: "Seç"
    },
    "confirm_remove_page": {
        en: "This page will be completely removed from the system. This action is permanent. Are you sure?",
        tr: "Bu sayfa sistemden tamamen silinecek. Bu işlem geri alınamaz. Emin misiniz?"
    }
};