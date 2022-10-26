
$(document).ready(() => {
    StockDef.InitalizeComponent();
})

namespace StockDef {

    var sys: SystemTools = new SystemTools();
    var SysSession: SystemSession = GetSystemSession(Modules.StockDef);
    var ModelItem: Array<I_Item> = new Array<I_Item>();
    var Modelitemyear: Array<I_ItemYear> = new Array<I_ItemYear>();
    var singleItem: I_Item = new I_Item ();
    var singleitemyear: I_ItemYear = new I_ItemYear();
    var Model: ITEM_ITEMYEAR = new ITEM_ITEMYEAR();

    var I_ItemDetails: Array<IQ_GetItemStoreInfo> = new Array<IQ_GetItemStoreInfo>();
    var I_ItemDetailsfilter: Array<IQ_GetItemStoreInfo> = new Array<IQ_GetItemStoreInfo>();
    var I_CategoryDetails: Array<I_D_Category> = new Array<I_D_Category>();
    var I_ItemFamilyDetails: Array<I_ItemFamily> = new Array<I_ItemFamily>();
    var I_ItemFamilyDetailsfilter: Array<I_ItemFamily> = new Array<I_ItemFamily>();
    var data: Array<I_Item> = new Array<I_Item>();
    var I_D_UOMDetails: Array<I_D_UOM> = new Array<I_D_UOM>();
    var compcode: number;//SharedSession.CurrentEnvironment.CompCode;
    var BranchCode: number;//SharedSession.CurrentEnvironment.CompCode; 
    var GridCategory: ESGrid = new ESGrid();
    var GridItemFamily: ESGrid = new ESGrid();
    var Griditems: ESGrid = new ESGrid();

    var btnCategory: HTMLButtonElement;
    var btnItemFamily: HTMLButtonElement;
    var btnItems: HTMLButtonElement;    


    var txt_Type: HTMLInputElement;    

    var IsFamily = false;

    export function InitalizeComponent() {
        debugger
        compcode = Number(SysSession.CurrentEnvironment.CompCode);
        BranchCode = Number(SysSession.CurrentEnvironment.BranchCode);          
        InitalizeControls();
        InitalizeEvent();    
        GetAllCategory();
        GetAllItemFamily();
        GetAllItem();                            
        InitializeGridControlCategory();  
    }
    function InitalizeControls() {
        btnCategory = document.getElementById('btnCategory') as HTMLButtonElement;
        btnItemFamily = document.getElementById('btnItemFamily') as HTMLButtonElement;
        btnItems = document.getElementById('btnItems') as HTMLButtonElement;       
        txt_Type = document.getElementById('txt_Type') as  HTMLInputElement;  
    }
    function InitalizeEvent() {
        btnCategory.onclick = btnCategory_onclick;
        btnItemFamily.onclick = btnItemFamily_onclick;
        btnItems.onclick = btnItems_onclick;
        txt_Type.onchange = txt_Type_onchange;
    }           
    function txt_Type_onchange() {
        debugger
        if (IsFamily == true) {
            I_ItemFamilyDetailsfilter = I_ItemFamilyDetails.filter(x => x.CatID == Number(txt_Type.value));
            InitializeGridControlItemFamily();
        } else {
            I_ItemDetailsfilter = I_ItemDetails.filter(x => x.ItemFamilyID == Number(txt_Type.value));
            InitializeGridControlItem();
		}

	}
    function btnCategory_onclick() {
        $('#txt_Type').addClass('display_none');
        InitializeGridControlCategory();  
    }
    function btnItemFamily_onclick() {
        IsFamily = true;
        $('#txt_Type').html("");    
        $('#txt_Type').removeClass('display_none');  
        for (var i = 0; i < I_CategoryDetails.length; i++) {
            $('#txt_Type').append('<option value =' + I_CategoryDetails[i].CatID + '>' + I_CategoryDetails[i].DescA +'</option>');
		}
        txt_Type_onchange();             
    }
    function btnItems_onclick() {
        IsFamily = false;
        $('#txt_Type').html("");
        $('#txt_Type').removeClass('display_none'); 
        for (var i = 0; i < I_ItemFamilyDetails.length; i++) {
            $('#txt_Type').append('<option value =' + I_ItemFamilyDetails[i].ItemFamilyID + '>' + I_ItemFamilyDetails[i].DescA + '</option>');
        }
        txt_Type_onchange();        
	}
    function GetAllItem() {
        debugger
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "GetAllItem"),
            data: { CompCode: compcode },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {       
                    I_ItemDetails = result.Response as Array<IQ_GetItemStoreInfo>;         
                }
            }
        }); 
    }
    function GetAllCategory() {
        debugger
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "GetAllCategory"),
            data: { CompCode: compcode },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {
                    I_CategoryDetails = result.Response as Array<I_D_Category>;
                }
            }
        });
    }
    function GetAllItemFamily() {
        debugger
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "GetAllItemFamily"),
            data: { CompCode: compcode },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {
                    I_ItemFamilyDetails = result.Response as Array<I_ItemFamily>;
                   
                }
            }
        });
    }

    function InitializeGridControlCategory() {   
        GridCategory.ESG.NameTable = 'GridCategory';
        GridCategory.ESG.PrimaryKey = 'CatID';
        GridCategory.ESG.Right = true;
        GridCategory.ESG.Edit = true;
        GridCategory.ESG.Add = true;
        GridCategory.ESG.DeleteRow = true;
        GridCategory.ESG.CopyRow = true;
        GridCategory.ESG.Back = true;
        GridCategory.ESG.Save = true;
        GridCategory.ESG.OnfunctionSave = SaveNewCategory;
        //GridCategory.ESG.OnfunctionTotal = computeTotal;
        GridCategory.ESG.OnRowDoubleClicked = DoubleClickedCategory;
        GridCategory.ESG.object = new I_D_Category();
        GridCategory.Column = [
            { title: "ID", Name: "CatID", Type: "number", value: "0", style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "CompCode", Name: "CompCode", Type: "text", value: compcode.toString(), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "كود الفئه", Name: "CatCode", Type: "text", value: "", style: "width: 10%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            { title: "الوصف بالعربي", Name: "DescA", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            { title: "الوصف بالانجليزي", Name: "DescL", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
        ]

        BindGridControl(GridCategory);
        DisplayDataGridControl(I_CategoryDetails, GridCategory);
    }
    function InitializeGridControlItemFamily() {

        GridItemFamily.ESG.NameTable = 'GridCategory';
        GridItemFamily.ESG.PrimaryKey = 'ItemFamilyID';
        GridItemFamily.ESG.Right = true;
        GridItemFamily.ESG.Edit = true;
        GridItemFamily.ESG.Add = true;
        GridItemFamily.ESG.DeleteRow = true;
        GridItemFamily.ESG.CopyRow = true;
        GridItemFamily.ESG.Back = true;
        GridItemFamily.ESG.Save = true;
        GridItemFamily.ESG.OnfunctionSave = SaveNewItemFamily;
        //GridItemFamily.ESG.OnfunctionTotal = computeTotal;
        GridItemFamily.ESG.OnRowDoubleClicked = DoubleClickedItemFamily;
        GridItemFamily.ESG.object = new I_ItemFamily();
        GridItemFamily.Column = [
            { title: "ID", Name: "ItemFamilyID", Type: "number", value: "0", style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "CatID", Name: "CatID", Type: "text", value: (txt_Type.value), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "CompCode", Name: "CompCode", Type: "text", value: compcode.toString(), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "الكود", Name: "FamilyCode", Type: "text", value: "", style: "width: 10%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            { title: "الوصف بالعربي", Name: "DescA", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "الوصف بالنجليزي", Name: "DescL", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            
        ]

        BindGridControl(GridItemFamily);
        DisplayDataGridControl(I_ItemFamilyDetailsfilter, GridItemFamily);
    }
    function InitializeGridControlItem() {

        Griditems.ESG.NameTable = 'GridCategory';
        Griditems.ESG.PrimaryKey = 'ItemID';
        Griditems.ESG.Right = true;
        Griditems.ESG.Edit = true;
        Griditems.ESG.Add = true;
        Griditems.ESG.DeleteRow = true;
        Griditems.ESG.CopyRow = true;
        Griditems.ESG.Back = true;
        Griditems.ESG.Save = true;
        Griditems.ESG.OnfunctionSave = SaveNewItem;
        //Griditems.ESG.OnfunctionTotal = computeTotal;
        //Griditems.ESG.OnRowDoubleClicked = DoubleClickedItem;
        Griditems.ESG.object = new IQ_GetItemStoreInfo();
        Griditems.Column = [
            { title: "ID", Name: "ItemID", Type: "number", value: "0", style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "ItemYearID", Name: "ItemYearID", Type: "number", value: (txt_Type.value), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "UomID", Name: "UomID", Type: "number", value: (txt_Type.value), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "ItemFamilyID", Name: "ItemFamilyID", Type: "number", value: (txt_Type.value), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "CompCode", Name: "CompCode", Type: "text", value: compcode.toString(), style: "width: 10%", Edit: false, visible: false, Validation: Valid.Set(false), ColumnType: ControlType.Input() },
            { title: "كود الصنف", Name: "ItemCode", Type: "text",value:"", style: "width: 10%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            { title: "الوصف بالعربي", Name: "Itm_DescA", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            /*{ title: "الوصف بالانجليزي", Name: "Itm_DescE", Type: "text", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },*/
            { title: "معمل التحويل", Name: "UnitWholePrice", Type: "number", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
            { title: "السعر", Name: "UnitPrice", Type: "number", value: "", style: "width: 30%", Edit: true, visible: true, Validation: Valid.Set(true), ColumnType: ControlType.Input() },
        ]         
        BindGridControl(Griditems);
        DisplayDataGridControl(I_ItemDetailsfilter, Griditems);
    }

    function SaveNewCategory() { 
        let data = JSON.stringify(GridCategory.ESG.Model);
         
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "UpdateCategory"),
            data: { data: data },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {                                       
                    GetAllCategory();
                    DisplayDataGridControl(I_CategoryDetails, GridCategory);

                }
            }
        });         
    }
    function SaveNewItemFamily() {           
        let data = JSON.stringify(GridItemFamily.ESG.Model);   
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "UpdateItemFamily"),
            data: { data: data },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {               
                    GetAllItemFamily();
                    txt_Type_onchange();
                }
            }
        });         
    }
    function SaveNewItem() { 
        debugger
        let fltrInsert: Array<IQ_GetItemStoreInfo> = new Array<IQ_GetItemStoreInfo>();
        let fltrUpdate: Array<IQ_GetItemStoreInfo> = new Array<IQ_GetItemStoreInfo>(); 
        Model = new ITEM_ITEMYEAR();
        ModelItem = new Array<I_Item>();
        Modelitemyear = new Array<I_ItemYear>();

        let fltred: Array<IQ_GetItemStoreInfo> = Griditems.ESG.Model;
        fltrInsert = fltred.filter(x => x.StatusFlag == "i");
        fltrUpdate = fltred.filter(x => x.StatusFlag == "u");

        for (var i = 0; i < fltrInsert.length; i++) {
            singleItem = new I_Item ();
            singleitemyear = new I_ItemYear ();

            singleItem.CompCode = fltrInsert[i].CompCode;
            singleItem.DescA = fltrInsert[i].Itm_DescA;
            singleItem.DescL = fltrInsert[i].Itm_DescE;
            singleItem.ItemCode = fltrInsert[i].ItemCode;
            singleItem.UomID = 4;
            singleItem.ItemFamilyID = fltrInsert[i].ItemFamilyID;
            singleItem.ItemID = fltrInsert[i].ItemID;
            singleItem.StatusFlag = fltrInsert[i].StatusFlag;  

            singleitemyear.FinYear =Number(SysSession.CurrentEnvironment.CurrentYear);
            singleitemyear.ItemID = fltrInsert[i].ItemID;
            singleitemyear.ItemYearID = fltrInsert[i].ItemYearID;
            singleitemyear.UnitPrice = fltrInsert[i].UnitPrice;
            singleitemyear.UnitWholePrice = fltrInsert[i].UnitWholePrice;
            singleitemyear.StatusFlag = 'i';
            ModelItem.push(singleItem)
            Modelitemyear.push(singleitemyear)
		}
        for (var i = 0; i < fltrUpdate.length; i++) {
            singleItem = new I_Item();
            singleitemyear = new I_ItemYear();

            singleItem.CompCode = fltrUpdate[i].CompCode;
            singleItem.DescA = fltrUpdate[i].Itm_DescA;
            singleItem.DescL = fltrUpdate[i].Itm_DescE;
            singleItem.ItemCode = fltrUpdate[i].ItemCode;
            singleItem.ItemFamilyID = fltrUpdate[i].ItemFamilyID;
            singleItem.UomID = fltrUpdate[i].UomID;
            singleItem.ItemID = fltrUpdate[i].ItemID;
            singleItem.StatusFlag = fltrUpdate[i].StatusFlag;

            singleitemyear.FinYear = Number(SysSession.CurrentEnvironment.CurrentYear);   
            singleitemyear.ItemID = fltrUpdate[i].ItemID;
            singleitemyear.ItemYearID = fltrUpdate[i].ItemYearID;
            singleitemyear.UnitPrice = fltrUpdate[i].UnitPrice;
            singleitemyear.UnitWholePrice = fltrUpdate[i].UnitWholePrice;
            singleitemyear.StatusFlag = 'u';
            ModelItem.push(singleItem)
            Modelitemyear.push(singleitemyear)
        }
        Model.I_Item = ModelItem;
        Model.I_ItemYear = Modelitemyear;
        let data = JSON.stringify(Model);
         
        Ajax.Callsync({
            type: "Get",
            url: sys.apiUrl("Items", "UpdateItems"),
            data: { data: data },
            success: (d) => {
                let result = d as BaseResponse;
                if (result.IsSuccess) {
                    GetAllItem();
                    txt_Type_onchange();

                }
            }
        });         
    }     

    function DoubleClickedCategory() {
        alert(GridCategory.ESG.SelectedKey);
    }
    function DoubleClickedItemFamily() {
        alert(GridItemFamily.ESG.SelectedKey);
    }
    function DoubleClickedItem() {
        alert(Griditems.ESG.SelectedKey);
    }     

	 

}
