
$(document).ready(() => {
    Reports.InitalizeComponent();
})

namespace Reports {

    var sys: SystemTools = new SystemTools();
    var SysSession: SystemSession = GetSystemSession(Modules.Quotation);
    var I_D_CatDetails: Array<I_D_Category> = new Array<I_D_Category>();
    var InvQuotation: Array<I_Sls_TR_Invoice> = new Array<I_Sls_TR_Invoice>();
    var InvoiceDisplay: Array<I_Sls_TR_Invoice> = new Array<I_Sls_TR_Invoice>();
    var compcode: number;//SharedSession.CurrentEnvironment.CompCode;
    var BranchCode: number;//SharedSession.CurrentEnvironment.CompCode;  
    var ReportGridInv: JsGrid = new JsGrid();

    var btnExpense: HTMLButtonElement;
    var btnSumDaily: HTMLButtonElement;
    var btnDetDaily: HTMLButtonElement;
    var btnGeneralSum	: HTMLButtonElement;
    var btnGeneralDet	: HTMLButtonElement;
    var btnInventory: HTMLButtonElement;
    var btnShow: HTMLButtonElement;
    


    export function InitalizeComponent() {  
        compcode = Number(SysSession.CurrentEnvironment.CompCode);
        BranchCode = Number(SysSession.CurrentEnvironment.BranchCode);
        InitalizeControls();
        InitalizeEvents();
        debugger
        $('#txtFromDate').val(DateStartMonth());
        $('#txtToDate').val(ConvertToDateDash(GetDate()) <= ConvertToDateDash(SysSession.CurrentEnvironment.EndDate) ? GetDate() : SysSession.CurrentEnvironment.EndDate);

        InitializeGridInvoice();
        Display();
    }
    function InitalizeEvents() {
        btnSumDaily.onclick = () => { btnPrint(1,2); };
        btnDetDaily.onclick = () => { btnPrint(2,1); };
        btnGeneralSum.onclick = () => { btnPrint(3,2); };
        btnGeneralDet.onclick = () => { btnPrint(4,1); };
        btnInventory.onclick = () => { btnPrint(5,0); };
        btnExpense.onclick = () => { btnPrint(6,0); };
        btnShow.onclick = () => { Display(); };
        
    }
    function InitalizeControls() {
        btnShow = document.getElementById('btnShow') as HTMLButtonElement;
        btnSumDaily = document.getElementById('btnSumDaily') as HTMLButtonElement;
        btnDetDaily = document.getElementById('btnDetDaily') as HTMLButtonElement;
        btnGeneralSum = document.getElementById('btnGeneralSum') as HTMLButtonElement;
        btnGeneralDet = document.getElementById('btnGeneralDet') as HTMLButtonElement;
        btnInventory = document.getElementById('btnInventory') as HTMLButtonElement; 
        btnExpense = document.getElementById('btnExpense') as HTMLButtonElement; 
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
        ReportGridInv.OnItemEditing = () => { };
        ReportGridInv.Columns = [
            { title: "الرقم", name: "InvoiceID", type: "text", width: "5%", visible: false },
            { title: "الرقم", name: "TrNo", type: "text", width: "5%" },
            { title: "الرقم المرجع", name: "RefNO", type: "text", width: "8%" },  
            {
                title: "التاريخ",
                width: "5%",
                itemTemplate: (s: string, item: I_Sls_TR_Invoice): HTMLLabelElement => {
                    let txt: HTMLLabelElement = document.createElement("label");

                    txt.innerHTML = DateFormat(item.TrDate);
                     
                    return txt;
                }
            },
            {
                title: "التاريخ",
                width: "5%",
                itemTemplate: (s: string, item: I_Sls_TR_Invoice): HTMLLabelElement => {
                    let txt: HTMLLabelElement = document.createElement("label");

                    if (item.ContractNo == '1') {
                        txt.innerHTML = 'A' 
                    }
                    else {
                        txt.innerHTML = 'B'

                    }

                    return txt;
                }
            },
            { title: "الخصم", name: "DiscountAmount", type: "text", width: "10%" },
            { title: "الاجمالي", name: "NetAfterVat", type: "text", width: "10%" },
            {
                title: "مسح",
                width: "5%",
                itemTemplate: (s: string, item: I_Sls_TR_Invoice): HTMLInputElement => {
                    let txt: HTMLInputElement = document.createElement("input");
                    txt.type = "button";
                    txt.value = ("Delete");
                    txt.id = "butDelete" + item.InvoiceID;
                    txt.className = "btn btn-custon-four btn-danger ";

                    txt.onclick = (e) => {
                        DeleteInvoice(item.InvoiceID);
                    };
                    return txt;
                }
            },




        ];
        ReportGridInv.Bind();
    }
    function Display() {
         
       let RFQFilter = $('#txtRFQFilter').val();
        let FromDat = $('#txtFromDate').val();
        let ToDat = $('#txtToDate').val();
         

        $("#ReportGrid").jsGrid("option", "pageIndex", 1);
        Ajax.Callsync({
            type: "GET",
            url: sys.apiUrl("SlsTrSales", "GetAllSlsInvoice"),
            data: { CompCode: compcode, BranchCode: BranchCode, CustomerId: 0, RFQFilter: RFQFilter, StartDate: FromDat, EndDate: ToDat },
            success: (d) => {
                debugger;
                let result = d as BaseResponse;
                if (result.IsSuccess) {
                    InvoiceDisplay = result.Response as Array<I_Sls_TR_Invoice>;

                    ReportGridInv.DataSource = InvoiceDisplay;
                    ReportGridInv.Bind();
                     
                }
            }
        });


    }
    function DeleteInvoice(btnId: number) {

        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("SlsTrSales", "DeleteInvoice"),
            data: { InvoiceID: btnId },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess == true) {

                    Display();
                    $('#viewmail').removeClass('active in');
                    $('#sendmail').addClass('active in');

                    $('#btnQuotations').removeClass('active');
                    $('#btnInvoice').addClass('active');

                } else {
                    DisplayMassage("Please refresh the page and try again", "Please refresh the page and try again", MessageType.Error);

                }
            }
        });
    }

    function btnPrint(typerep:number,type: number) {    
        let rp: ReportParameters = new ReportParameters();
        
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
        debugger
        rp.Type = type;
        rp.Typ = typerep;
        rp.Repdesign = 1;
        if (typerep == 1 || typerep == 2) {
            rp.FromDate =  GetDate();
            rp.ToDate =  GetDate();   
		}  
        else {
            rp.FromDate = DateFormatSql($('#txtFromDate').val());
            rp.ToDate = DateFormatSql($('#txtToDate').val()) ;
        }   
        if (typerep == 5) {
            debugger

            rp.FromDate = DateFormatSql($('#txtFromDate').val());
            rp.ToDate = DateFormatSql($('#txtToDate').val());

            rp.CatId = Number($('#txt_Shift').val());
            rp.ItemFamId = -1;
            rp.ItemID = -1;
            rp.Status = 1; 
            Ajax.Callsync({
                url: Url.Action("IProc_Rpt_ItemStockIncome", "GeneralReports"),
                data: rp,
                success: (d) => {
                    let result = d.result as string;
                    window.open(result, "_blank");  
                }
            })
        }
        else if (typerep == 6) {  
            rp.FromDate = DateFormatSql($('#txtFromDate').val());
            rp.ToDate = DateFormatSql($('#txtToDate').val());
        Ajax.Callsync({
            url: Url.Action("Prnt_Expense", "GeneralReports"),
            data: rp,
            success: (d) => {
                let result = d.result as string;
                window.open(result, "_blank");
               
            }
        })
        }
        else {     
        Ajax.Callsync({
            url: Url.Action("Prnt_SumDaily", "GeneralReports"),
            data: rp,
            success: (d) => {
                let result = d.result as string;
                window.open(result, "_blank");
               
            }
        })
        }  
    }          

}












