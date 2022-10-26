$(document).ready(function () {
    QuotationView.InitalizeComponent();
});
var QuotationView;
(function (QuotationView) {
    var sys = new SystemTools();
    //var sys: _shared = new _shared();
    var SysSession = GetSystemSession(Modules.QuotationView);
    var InvoiceItemsDetailsModel = new Array();
    var invoiceItemSingleModel = new I_Sls_TR_InvoiceItems();
    var InvoiceModel = new I_Sls_TR_Invoice();
    var MasterDetailsModel = new SlsInvoiceMasterDetails();
    var AllStock = new AllItems();
    var btn_basket;
    var btn_Expens;
    var btnsave;
    var btnsaveExpens;
    var btnClean;
    var DiscountAmount;
    var RoundingAmount;
    var modal = document.getElementById("myModal");
    var ModalExpens = document.getElementById("myModalExpens");
    debugger;
    btn_Expens = document.getElementById('btn_Expens');
    btn_basket = document.getElementById('btn_basket');
    btnsaveExpens = document.getElementById('btnsaveExpens');
    btnsave = document.getElementById('btnsave');
    btnClean = document.getElementById('btnClean');
    DiscountAmount = document.getElementById('DiscountAmount');
    RoundingAmount = document.getElementById('RoundingAmount');
    var CountGrid = 0;
    var inputid;
    var CUSTOM3 = false;
    function InitalizeComponent() {
        CUSTOM3 = SysSession.CurrentPrivileges.CUSTOM3;
        $("#txtDate").val(GetDate());
        GetGetAllStock();
        btn_Expens.onclick = btn_Expens_onclick;
        btn_basket.onclick = btn_basket_onclick;
        btnsave.onclick = btnsave_onclick;
        btnsaveExpens.onclick = btnsaveExpens_onclick;
        btnClean.onclick = btnClean_onclick;
        debugger;
        RoundingAmount.onkeyup = function () { computeTotal(); };
        DiscountAmount.onkeyup = function () { computeTotal(); };
        ChackBadgeNum();
    }
    QuotationView.InitalizeComponent = InitalizeComponent;
    function btn_Expens_onclick() {
        ModalExpens.style.display = "block";
    }
    function btn_basket_onclick() {
        modal.style.display = "block";
    }
    function ChackBadgeNum() {
        var BadgeNum = $('#BadgeNum').html();
        if (BadgeNum == '0') {
            $('#BadgeNum').addClass('display_none');
            $('#BadgeNum').removeClass('zoomInRight');
        }
        else {
            $('#BadgeNum').removeClass('display_none');
            $('#BadgeNum').addClass('zoomInRight');
        }
    }
    function GetGetAllStock() {
        Ajax.Callsync({
            type: "GET",
            url: sys.apiUrl("SlsTrSales", "GetAllStock"),
            success: function (d) {
                debugger;
                var result = d;
                if (result.IsSuccess) {
                    AllStock = result.Response;
                    //------------------------------------I_D_Category-----------------------------------
                    for (var i = 0; i < AllStock.I_D_Category.length; i++) {
                        BuildButCat(i);
                        $("#btnCat_" + i).html(AllStock.I_D_Category[i].DescA);
                        $("#btnCat_" + i).attr('Data_CatID', AllStock.I_D_Category[i].CatID);
                    }
                    //-----------------------------------------------------------------------
                    //------------------------------------I_ItemFamily----------------------------------- 
                    debugger;
                    var ItemFamily = AllStock.I_ItemFamily.filter(function (x) { return x.CatID == AllStock.I_D_Category[0].CatID; });
                    DisplayItemFamilyAndItems(ItemFamily);
                    //-----------------------------------------------------------------------
                }
            }
        });
    }
    function DisplayItemFamilyAndItems(ItemFamily) {
        debugger;
        $("#html_But").html('');
        for (var i = 0; i < ItemFamily.length; i++) {
            BuildButItemFamily(i);
            $("#DivItem_" + i).html('');
            var Items = AllStock.I_Item.filter(function (x) { return x.ItemFamilyID == ItemFamily[i].ItemFamilyID; });
            if (Items.length == 0) {
                $("#btnItemFamily_" + i).html(ItemFamily[i].DescA);
                $("#DivItem_" + i).attr('class', '');
                OnClickbutItem("#btnItemFamily_" + i, null);
            }
            if (Items.length == 1) {
                $("#btnItemFamily_" + i).html(Items[0].Itm_DescA + " " + "[ " + Items[0].UnitPrice + " ]");
                $("#btnItemFamily_" + i).attr('data_ID', Items[0].ItemID);
                $("#btnItemFamily_" + i).attr('title', Items[0].UnitPrice);
                $("#DivItem_" + i).attr('class', '');
                OnClickbutItem("#btnItemFamily_" + i, Items[0].ItemID);
            }
            else {
                $("#btnItemFamily_" + i).html(ItemFamily[i].DescA);
                for (var u = 0; u < Items.length; u++) {
                    var html = " <a title=\"" + Items[u].UnitPrice + "\" data_ID=\"" + Items[u].ItemID + "\" id=\"ButItem_" + Items[u].ItemID + "\" href=\"#\">" + Items[u].Itm_DescA + " [ " + Items[u].UnitPrice + " ]</a>  ";
                    $("#DivItem_" + i).append(html);
                    OnClickbutItem("#ButItem_" + Items[u].ItemID, Items[u].ItemID);
                }
            }
        }
    }
    function BuildButCat(cnt) {
        var html;
        html = "                 <li class=\" col-lg-12   LiButCat \" style=\"\">\n                                            <button id=\"btnCat_" + cnt + "\" type=\"button\" class=\" in animated zoomInLeft btn btn-custon-four btn-success px-5 BUTCat\">  --- </button>\n                                        </li>\n\n                                    ";
        $("#html_ButCat").append(html);
        $("#btnCat_" + cnt).click(function (e) {
            var CatID = Number($("#btnCat_" + cnt).attr('Data_CatID'));
            var ItemFamily = AllStock.I_ItemFamily.filter(function (x) { return x.CatID == CatID; });
            DisplayItemFamilyAndItems(ItemFamily);
        });
        return;
    }
    function BuildButItemFamily(cnt) {
        var html;
        html = "\n                <li class=\"dropdown col-lg-1 px-4 LiBut\" style=\"\">\n                 <button id=\"btnItemFamily_" + cnt + "\" type=\"button\" class=\"  btn btn-custon-four btn-success px-5 BUT\">   ItemFamily" + cnt + "</button>\n                  <div id=\"DivItem_" + cnt + "\" class=\"dropdown-content\">\n                    <a href=\"#\">Link 1</a>\n                    <a href=\"#\">Link 2</a>\n                    <a href=\"#\">Link 3</a>\n                   </li>\n            ";
        $("#html_But").append(html);
        return;
    }
    function OnClickbutItem(NameId, IDItem) {
        $(NameId).click(function (e) {
            var CanAdd = true;
            if (CountGrid > 0) {
                for (var i = 0; i < CountGrid; i++) {
                    CanAdd = validationItems(i, IDItem);
                    if (CanAdd == false) {
                        break;
                    }
                }
            }
            if (CanAdd) {
                var BadgeNum = Number($('#BadgeNum').html());
                $('#BadgeNum').html((BadgeNum + 1).toString());
                ChackBadgeNum();
                AddNewRow(IDItem);
            }
            $(NameId).addClass('animated zoomOutLeft');
            setTimeout(function () {
                $(NameId).removeClass('animated zoomOutLeft');
            }, 700);
        });
    }
    function validationItems(rowcount, IDItem) {
        if ($("#txt_StatusFlag" + rowcount).val() != 'd' && $("#txt_StatusFlag" + rowcount).val() != 'm') {
            if ($("#txt_ItemID" + rowcount).val() == IDItem) {
                computeRows(rowcount, false);
                return false;
            }
        }
        return true;
    }
    function BuildRowItem(cnt) {
        debugger;
        var disabled = CUSTOM3 == false ? '" disabled="disabled"' : '';
        var html;
        html = '<tr id= "No_Row' + cnt + '" class="  animated zoomIn ">' +
            '<td><button id="btn_minus' + cnt + '" type="button" class="btn btn-custon-four btn-danger"><i class="fa fa-minus-circle"></i></button></td>' +
            '<td><input  id="txtSerial' + cnt + '" disabled="disabled"  type="text" class="form-control" placeholder="SR"></td>' +
            '<td> <textarea id="Description' + cnt + '" disabled="disabled" name="Description" type="text" class="form-control" style="height:34px" placeholder="Description" spellcheck="false"></textarea></td>' +
            '<td><input  id="QTY' + cnt + '"  ' + disabled + ' type="number" class="form-control" placeholder="QTY"></td>' +
            '<td><input  id="UnitPrice' + cnt + '"   ' + disabled + '  value="0" type="number" class="form-control" placeholder="Unit Price"></td>' +
            '<td><input  id="TotalPrice' + cnt + '" disabled="disabled" value="0" type="number" class="form-control" placeholder="Unit Price"></td>' +
            ' <input  id="txt_StatusFlag' + cnt + '" type="hidden" class="form-control"> ' +
            ' <input  id="txt_ItemID' + cnt + '" type="hidden" class="form-control"> ' +
            '</tr>';
        $("#Table_Data").append(html);
        $("#UnitPrice" + cnt).on('keyup', function (e) {
            computeRows(cnt, true);
        });
        $("#QTY" + cnt).on('keyup', function (e) {
            computeRows(cnt, true);
        });
        $("#UnitPrice" + cnt).on('change', function (e) {
            computeRows(cnt, true);
        });
        $("#QTY" + cnt).on('change', function (e) {
            computeRows(cnt, true);
        });
        $("#btn_minus" + cnt).click(function (e) {
            DeleteRow(cnt);
        });
    }
    function DisplayRowItem(cnt, IDItem) {
        var Items = AllStock.I_Item.filter(function (x) { return x.ItemID == IDItem; });
        $("#txt_ItemID" + cnt).val(Items[0].ItemID);
        $("#Description" + cnt).val(Items[0].Itm_DescA);
        $("#UnitPrice" + cnt).val(Items[0].UnitPrice);
        $("#QTY" + cnt).val('1');
        $("#TotalPrice" + cnt).val(Items[0].UnitPrice);
    }
    function AddNewRow(IDItem) {
        $('paginationSwitch').addClass("display_none");
        $('.no-records-found').addClass("display_none");
        BuildRowItem(CountGrid);
        DisplayRowItem(CountGrid, IDItem);
        $("#txt_StatusFlag" + CountGrid).val("i"); //In Insert mode 
        CountGrid++;
        Insert_Serial();
        computeTotal();
    }
    function DeleteRow(RecNo) {
        $("#txt_StatusFlag" + RecNo).val() == 'i' ? $("#txt_StatusFlag" + RecNo).val('m') : $("#txt_StatusFlag" + RecNo).val('d');
        computeRows(RecNo, false);
        computeTotal();
        $("#No_Row" + RecNo).attr("hidden", "true");
        Insert_Serial();
        var BadgeNum = Number($('#BadgeNum').html());
        $('#BadgeNum').html((BadgeNum - 1).toString());
        ChackBadgeNum();
    }
    function computeRows(rowcount, flagChang) {
        var qty = Number($("#QTY" + rowcount).val());
        var Price = Number($("#UnitPrice" + rowcount).val());
        if (flagChang == false) {
            $("#QTY" + rowcount).val(qty + 1);
        }
        qty = Number($("#QTY" + rowcount).val());
        $("#TotalPrice" + rowcount).val(qty * Price);
        computeTotal();
    }
    function computeTotal() {
        debugger;
        var NetCount = 0;
        var TotalSer = 0;
        var TotalQTY = 0;
        var NetAfterVat = 0;
        var Rounding = 0;
        var Discount = 0;
        for (var i = 0; i < CountGrid; i++) {
            if ($("#txt_StatusFlag" + i).val() != 'm' && $("#txt_StatusFlag" + i).val() != 'd') {
                NetCount += Number($("#TotalPrice" + i).val());
                NetCount = Number(NetCount.toFixed(2).toString());
                TotalSer += 1;
                TotalQTY += Number($("#QTY" + i).val());
            }
        }
        debugger;
        $("#TotalSer").val(TotalSer);
        $("#TotalQTY").val(TotalQTY);
        $("#TotalNet").val(NetCount);
        Rounding = Number($("#RoundingAmount").val());
        Discount = Number($("#DiscountAmount").val());
        NetAfterVat = Number(((NetCount + Rounding) - Discount).toFixed(2));
        $("#NetAfterVat").val(NetAfterVat);
    }
    function Insert_Serial() {
        var Chack_Flag = false;
        var flagval = "";
        var Ser = 1;
        for (var i = 0; i < CountGrid; i++) {
            flagval = $("#txt_StatusFlag" + i).val();
            if (flagval != "d" && flagval != "m") {
                $("#txtSerial" + i).val(Ser);
                Ser++;
            }
            if (flagval == 'd' || flagval == 'm' || flagval == 'i') {
                Chack_Flag = true;
            }
            if (Chack_Flag) {
                if ($("#txt_StatusFlag" + i).val() != 'i' && $("#txt_StatusFlag" + i).val() != 'm' && $("#txt_StatusFlag" + i).val() != 'd') {
                    $("#txt_StatusFlag" + i).val('u');
                }
            }
        }
    }
    function btnsave_onclick() {
        insert();
    }
    function btnClean_onclick() {
        $(".modal-content").addClass('animated zoomOut ');
        setTimeout(function () {
            $(".modal-content").removeClass('animated zoomOut');
            modal.style.display = "none";
        }, 700);
        CountGrid = 0;
        $("#Table_Data").html('');
        $("#txtDate").val(GetDate());
        $("#txtRFQ").val('');
        $("#txtRemark").val('');
        $("#TotalNet").val('');
        $("#TotalSer").val(0);
        $("#TotalNet").val(0);
        $("#TotalQTY").val(0);
        $('#BadgeNum').html('0');
        ChackBadgeNum();
    }
    function Assign() {
        //var StatusFlag: String;
        InvoiceModel = new I_Sls_TR_Invoice();
        InvoiceItemsDetailsModel = new Array();
        InvoiceModel.Status = 1;
        InvoiceModel.CompCode = 1;
        InvoiceModel.BranchCode = 1;
        InvoiceModel.CreatedAt = DateTimeFormat(Date().toString());
        InvoiceModel.CreatedBy = sys.SysSession.CurrentEnvironment.UserCode;
        InvoiceModel.TrType = 0; //0 invoice 1 return     
        InvoiceModel.InvoiceID = 0;
        InvoiceModel.TrDate = $("#txtDate").val();
        InvoiceModel.RefNO = $("#txtRFQ").val();
        InvoiceModel.Remark = $("#txtRemark").val();
        InvoiceModel.ContractNo = $("#txt_Shift").val();
        InvoiceModel.TotalAmount = Number($("#TotalNet").val());
        InvoiceModel.RoundingAmount = Number($("#RoundingAmount").val());
        InvoiceModel.DiscountAmount = Number($("#DiscountAmount").val());
        InvoiceModel.NetAfterVat = Number($("#NetAfterVat").val());
        // Details
        for (var i = 0; i < CountGrid; i++) {
            var StatusFlag = $("#txt_StatusFlag" + i).val();
            if (StatusFlag == "i") {
                invoiceItemSingleModel = new I_Sls_TR_InvoiceItems();
                invoiceItemSingleModel.InvoiceItemID = 0;
                invoiceItemSingleModel.ItemID = Number($("#txt_ItemID" + i).val());
                invoiceItemSingleModel.Serial = Number($("#txtSerial" + i).val());
                invoiceItemSingleModel.SoldQty = Number($('#QTY' + i).val());
                invoiceItemSingleModel.NetUnitPrice = Number($("#UnitPrice" + i).val());
                invoiceItemSingleModel.ItemTotal = Number($("#Totalprice" + i).val());
                invoiceItemSingleModel.NetAfterVat = Number($("#Totalprice" + i).val());
                invoiceItemSingleModel.UomID = 4;
                InvoiceItemsDetailsModel.push(invoiceItemSingleModel);
            }
        }
        MasterDetailsModel.I_Sls_TR_Invoice = InvoiceModel;
        MasterDetailsModel.I_Sls_TR_InvoiceItems = InvoiceItemsDetailsModel;
    }
    function insert() {
        Assign();
        Ajax.Callsync({
            type: "POST",
            url: sys.apiUrl("SlsTrSales", "InsertInvoiceMasterDetail"),
            data: JSON.stringify(MasterDetailsModel),
            success: function (d) {
                var result = d;
                if (result.IsSuccess == true) {
                    var res = result.Response;
                    res.InvoiceID;
                    Success();
                    $('#TrNo').html(' تم اصدار فاتوره رقم ( ' + res.TrNo + ' )');
                    $('#viewmail').attr('style', ' background-color: cornflowerblue;');
                    setTimeout(function () {
                        $('#TrNo').html(' ');
                        $('#viewmail').attr('style', ' ');
                    }, 4000);
                }
                else {
                }
            }
        });
    }
    function Success() {
        $(".modal-content").addClass('animated zoomOutDown ');
        setTimeout(function () {
            $(".modal-content").removeClass('animated zoomOutDown');
            modal.style.display = "none";
        }, 700);
        CountGrid = 0;
        $("#Table_Data").html('');
        $("#txtDate").val(GetDate());
        $("#txtRFQ").val('');
        $("#txtRemark").val('');
        $("#TotalNet").val('');
        $("#TotalSer").val(0);
        $("#TotalNet").val(0);
        $("#TotalQTY").val(0);
        $("#NetAfterVat").val(0);
        $("#DiscountAmount").val(0);
        $("#RoundingAmount").val(0);
        $('#BadgeNum').html('0');
        ChackBadgeNum();
    }
    function btnsaveExpens_onclick() {
        if ($("#txtDescA").val().trim() == '') {
            Errorinput($("#txtDescA"));
            return;
        }
        if (Number($("#txtAmount").val()) == 0) {
            Errorinput($("#txtAmount"));
            return;
        }
        var ExtraField = "";
        var Remarks_EX = "";
        var ExpenseI_By = sys.SysSession.CurrentEnvironment.UserCode;
        var Shift_EX = $("#txt_Shift_EX").val();
        var TrDate = $("#txtDate").val();
        var Desc = $("#txtDescA").val();
        var Amount = Number($("#txtAmount").val());
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("SlsTrSales", "ExpensMony"),
            data: { Amount: Amount, Desc: Desc, TrDate: TrDate, ExpenseI_By: ExpenseI_By, Remarks: Remarks_EX, Shift: Shift_EX, ExtraField: ExtraField },
            success: function (d) {
                var result = d;
                if (result.IsSuccess == true) {
                    $("#txtDescA").val('');
                    $("#txtAmount").val('');
                    $('#viewmail').attr('style', ' background-color: #780000;');
                    setTimeout(function () {
                        $('#viewmail').attr('style', ' ');
                    }, 4000);
                    $(".modal-contentE").addClass('animated fadeOutDown ');
                    setTimeout(function () {
                        $(".modal-contentE").removeClass('animated fadeOutDown');
                        ModalExpens.style.display = "none";
                    }, 700);
                }
                else {
                }
            }
        });
    }
})(QuotationView || (QuotationView = {}));
//# sourceMappingURL=QuotationView.js.map