$(document).ready(function () {
    Reports.InitalizeComponent();
});
var Reports;
(function (Reports) {
    var sys = new SystemTools();
    var SysSession = GetSystemSession(Modules.Quotation);
    var I_D_CatDetails = new Array();
    var InvQuotation = new Array();
    var InvoiceDisplay = new Array();
    var compcode; //SharedSession.CurrentEnvironment.CompCode;
    var BranchCode; //SharedSession.CurrentEnvironment.CompCode;  
    var ReportGridInv = new JsGrid();
    var btnExpense;
    var btnSumDaily;
    var btnDetDaily;
    var btnGeneralSum;
    var btnGeneralDet;
    var btnInventory;
    var btnShow;
    function InitalizeComponent() {
        compcode = Number(SysSession.CurrentEnvironment.CompCode);
        BranchCode = Number(SysSession.CurrentEnvironment.BranchCode);
        InitalizeControls();
        InitalizeEvents();
        debugger;
        $('#txtFromDate').val(DateStartMonth());
        $('#txtToDate').val(ConvertToDateDash(GetDate()) <= ConvertToDateDash(SysSession.CurrentEnvironment.EndDate) ? GetDate() : SysSession.CurrentEnvironment.EndDate);
        InitializeGridInvoice();
        Display();
    }
    Reports.InitalizeComponent = InitalizeComponent;
    function InitalizeEvents() {
        btnSumDaily.onclick = function () { btnPrint(1, 2); };
        btnDetDaily.onclick = function () { btnPrint(2, 1); };
        btnGeneralSum.onclick = function () { btnPrint(3, 2); };
        btnGeneralDet.onclick = function () { btnPrint(4, 1); };
        btnInventory.onclick = function () { btnPrint(5, 0); };
        btnExpense.onclick = function () { btnPrint(6, 0); };
        btnShow.onclick = function () { Display(); };
    }
    function InitalizeControls() {
        btnShow = document.getElementById('btnShow');
        btnSumDaily = document.getElementById('btnSumDaily');
        btnDetDaily = document.getElementById('btnDetDaily');
        btnGeneralSum = document.getElementById('btnGeneralSum');
        btnGeneralDet = document.getElementById('btnGeneralDet');
        btnInventory = document.getElementById('btnInventory');
        btnExpense = document.getElementById('btnExpense');
    }
    function InitializeGridInvoice() {
        //let res: any = GetResourceList("");
        //$("#id_ReportGrid").attr("style", ""); 
        ReportGridInv.ElementName = "ReportGridInv";
        ReportGridInv.PrimaryKey = "InvoiceID";
        ReportGridInv.Paging = true;
        ReportGridInv.PageSize = 6;
        ReportGridInv.Sorting = true;
        ReportGridInv.InsertionMode = JsGridInsertionMode.Binding;
        ReportGridInv.Editing = false;
        ReportGridInv.Inserting = false;
        ReportGridInv.SelectedIndex = 1;
        ReportGridInv.SwitchingLanguageEnabled = false;
        ReportGridInv.OnItemEditing = function () { };
        ReportGridInv.Columns = [
            { title: "الرقم", name: "InvoiceID", type: "text", width: "5%", visible: false },
            { title: "الرقم", name: "TrNo", type: "text", width: "5%" },
            { title: "الرقم المرجع", name: "RefNO", type: "text", width: "8%" },
            {
                title: "التاريخ",
                width: "5%",
                itemTemplate: function (s, item) {
                    var txt = document.createElement("label");
                    txt.innerHTML = DateFormat(item.TrDate);
                    return txt;
                }
            },
            {
                title: "التاريخ",
                width: "5%",
                itemTemplate: function (s, item) {
                    var txt = document.createElement("label");
                    if (item.ContractNo == '1') {
                        txt.innerHTML = 'A';
                    }
                    else {
                        txt.innerHTML = 'B';
                    }
                    return txt;
                }
            },
            { title: "الخصم", name: "DiscountAmount", type: "text", width: "10%" },
            { title: "الاجمالي", name: "NetAfterVat", type: "text", width: "10%" },
            {
                title: "مسح",
                width: "5%",
                itemTemplate: function (s, item) {
                    var txt = document.createElement("input");
                    txt.type = "button";
                    txt.value = ("Delete");
                    txt.id = "butDelete" + item.InvoiceID;
                    txt.className = "btn btn-custon-four btn-danger ";
                    txt.onclick = function (e) {
                        DeleteInvoice(item.InvoiceID);
                    };
                    return txt;
                }
            },
        ];
        ReportGridInv.Bind();
    }
    function Display() {
        var RFQFilter = $('#txtRFQFilter').val();
        var FromDat = $('#txtFromDate').val();
        var ToDat = $('#txtToDate').val();
        $("#ReportGrid").jsGrid("option", "pageIndex", 1);
        Ajax.Callsync({
            type: "GET",
            url: sys.apiUrl("SlsTrSales", "GetAllSlsInvoice"),
            data: { CompCode: compcode, BranchCode: BranchCode, CustomerId: 0, RFQFilter: RFQFilter, StartDate: FromDat, EndDate: ToDat },
            success: function (d) {
                debugger;
                var result = d;
                if (result.IsSuccess) {
                    InvoiceDisplay = result.Response;
                    ReportGridInv.DataSource = InvoiceDisplay;
                    ReportGridInv.Bind();
                }
            }
        });
    }
    function DeleteInvoice(btnId) {
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("SlsTrSales", "DeleteInvoice"),
            data: { InvoiceID: btnId },
            success: function (d) {
                var result = d;
                if (result.IsSuccess == true) {
                    Display();
                    $('#viewmail').removeClass('active in');
                    $('#sendmail').addClass('active in');
                    $('#btnQuotations').removeClass('active');
                    $('#btnInvoice').addClass('active');
                }
                else {
                    DisplayMassage("Please refresh the page and try again", "Please refresh the page and try again", MessageType.Error);
                }
            }
        });
    }
    function btnPrint(typerep, type) {
        var rp = new ReportParameters();
        rp.CompCode = SysSession.CurrentEnvironment.CompCode;
        rp.BranchCode = SysSession.CurrentEnvironment.BranchCode;
        rp.CompNameA = SysSession.CurrentEnvironment.CompanyNameAr;
        rp.CompNameE = SysSession.CurrentEnvironment.CompanyName;
        rp.UserCode = SysSession.CurrentEnvironment.UserCode;
        rp.Tokenid = SysSession.CurrentEnvironment.Token;
        rp.ScreenLanguage = SysSession.CurrentEnvironment.ScreenLanguage;
        rp.SystemCode = SysSession.CurrentEnvironment.SystemCode;
        rp.SubSystemCode = SysSession.CurrentEnvironment.SubSystemCode;
        rp.BraNameA = SysSession.CurrentEnvironment.BranchName;
        rp.BraNameE = SysSession.CurrentEnvironment.BranchName;
        if (rp.BraNameA == null || rp.BraNameE == null) {
            rp.BraNameA = " ";
            rp.BraNameE = " ";
        }
        debugger;
        rp.Type = type;
        rp.Typ = typerep;
        rp.Repdesign = 1;
        if (typerep == 1 || typerep == 2) {
            rp.FromDate = GetDate();
            rp.ToDate = GetDate();
        }
        else {
            rp.FromDate = DateFormat($('#txtFromDate').val());
            rp.ToDate = DateFormat($('#txtToDate').val());
        }
        if (typerep == 5) {
            debugger;
            rp.FromDate = DateFormatRep($('#txtFromDate').val());
            rp.ToDate = DateFormatRep($('#txtToDate').val());
            rp.CatId = Number($('#txt_Shift').val());
            rp.ItemFamId = -1;
            rp.ItemID = -1;
            rp.Status = 1;
            Ajax.Callsync({
                url: Url.Action("IProc_Rpt_ItemStockIncome", "GeneralReports"),
                data: rp,
                success: function (d) {
                    var result = d.result;
                    window.open(result, "_blank");
                }
            });
        }
        else if (typerep == 6) {
            rp.FromDate = DateFormatRep($('#txtFromDate').val());
            rp.ToDate = DateFormatRep($('#txtToDate').val());
            Ajax.Callsync({
                url: Url.Action("Prnt_Expense", "GeneralReports"),
                data: rp,
                success: function (d) {
                    var result = d.result;
                    window.open(result, "_blank");
                }
            });
        }
        else {
            Ajax.Callsync({
                url: Url.Action("Prnt_SumDaily", "GeneralReports"),
                data: rp,
                success: function (d) {
                    var result = d.result;
                    window.open(result, "_blank");
                }
            });
        }
    }
})(Reports || (Reports = {}));
//# sourceMappingURL=Reports.js.map