using Inv.API.Models;
using Inv.API.Tools;
using Inv.BLL.Services.ISlsTRInvoice;
using Inv.BLL.Services.SlsInvoiceItems;
using Inv.DAL.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Inv.API.Controllers;
using System.Data.SqlClient;
using Inv.API.Models.CustomModel;

namespace Inv.API.Controllers
{
    public class SlsTrSalesController : BaseController
    {
        private readonly ISlsInvoiceItemsService SlsInvoiceItemsService;
        private readonly IISlsTRInvoiceService SlsTrSalesService;
        private readonly G_USERSController UserControl;

        public SlsTrSalesController(IISlsTRInvoiceService _ISlsTrSalesService, G_USERSController _Control, ISlsInvoiceItemsService _ISlsInvoiceItemsService)
        {
            this.SlsTrSalesService = _ISlsTrSalesService;
            this.SlsInvoiceItemsService = _ISlsInvoiceItemsService;
            this.UserControl = _Control;
        }
        [HttpPost, AllowAnonymous]
        public IHttpActionResult InsertInvoiceMasterDetail([FromBody] SlsInvoiceMasterDetails obj)
        {

            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    // doha 4-7-2021 GUID and QR Code 

                    //var compObj = db.G_COMPANY.Where(s => s.COMP_CODE == obj.I_Sls_TR_Invoice.CompCode).FirstOrDefault();
                    //var branchObj = db.G_BRANCH.Where(s => s.BRA_CODE == obj.I_Sls_TR_Invoice.BranchCode).FirstOrDefault();
                    //var QrCode= SystemToolsController.GenerateQRCode(compObj.NameA, branchObj.GroupVatNo, obj.I_Sls_TR_Invoice.TrDate.ToString(), obj.I_Sls_TR_Invoice.NetAfterVat.ToString(), obj.I_Sls_TR_Invoice.VatAmount.ToString());
                    //obj.I_Sls_TR_Invoice.QRCode = QrCode;
                    //var x=QrCode.Length;
                    ////////////

                    var Sls_TR_Invoice = SlsTrSalesService.Insert(obj.I_Sls_TR_Invoice);

                    for (int i = 0; i < obj.I_Sls_TR_InvoiceItems.Count; i++)
                    {
                        obj.I_Sls_TR_InvoiceItems[i].InvoiceID = Sls_TR_Invoice.InvoiceID;
                    }
                    SlsInvoiceItemsService.InsertLst(obj.I_Sls_TR_InvoiceItems);
                    // call process trans 

                    ResponseResult res = Shared.TransactionProcess(Convert.ToInt32(obj.I_Sls_TR_Invoice.CompCode), Convert.ToInt32(obj.I_Sls_TR_Invoice.BranchCode), Sls_TR_Invoice.InvoiceID, "Quotation", "Add", db);
                    if (res.ResponseState == true)
                    {
                        obj.I_Sls_TR_Invoice.TrNo = int.Parse(res.ResponseData.ToString());
                        dbTransaction.Commit();
                        return Ok(new BaseResponse(obj.I_Sls_TR_Invoice));
                    }
                    else
                    {
                        dbTransaction.Rollback();
                        return Ok(new BaseResponse(HttpStatusCode.ExpectationFailed, res.ResponseMessage));
                    }
                    ////////
                }
                catch (Exception ex)
                {
                    return Ok(new BaseResponse(HttpStatusCode.ExpectationFailed, ex.Message));
                }
            }

        }
        [HttpPost, AllowAnonymous]
        public IHttpActionResult updateInvoiceMasterDetail([FromBody] SlsInvoiceMasterDetails updatedObj)
        {

            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {

                    string st = SystemToolsController.GenerateGuid();
                    updatedObj.I_Sls_TR_Invoice.DocUUID = st;

                    var tm = DateTime.Now.ToString("HH:mm:ss");
                    updatedObj.I_Sls_TR_Invoice.TrTime = TimeSpan.Parse(tm);

                    //update Master
                    var Sls_TR_Invoice = SlsTrSalesService.Update(updatedObj.I_Sls_TR_Invoice);

                    //update Details
                    var insertedInvoiceItems = updatedObj.I_Sls_TR_InvoiceItems.Where(x => x.StatusFlag == 'i').ToList();
                    var updatedInvoiceItems = updatedObj.I_Sls_TR_InvoiceItems.Where(x => x.StatusFlag == 'u').ToList();
                    var deletedInvoiceItems = updatedObj.I_Sls_TR_InvoiceItems.Where(x => x.StatusFlag == 'd').ToList();

                    //loop insered  
                    foreach (var item in insertedInvoiceItems)
                    {
                        item.InvoiceID = updatedObj.I_Sls_TR_Invoice.InvoiceID;
                        var InsertedRec = SlsInvoiceItemsService.Insert(item);
                    }

                    //loop Update  
                    foreach (var item in updatedInvoiceItems)
                    {
                        item.InvoiceID = updatedObj.I_Sls_TR_Invoice.InvoiceID;
                        var updatedRec = SlsInvoiceItemsService.Update(item);
                    }

                    //loop Delete  
                    foreach (var item in deletedInvoiceItems)
                    {
                        int deletedId = item.InvoiceItemID;
                        //SlsInvoiceItemsService.Delete(deletedId);

                        string query = "delete [dbo].[I_Sls_TR_InvoiceItems] where InvoiceItemID = " + deletedId + "";
                        db.Database.ExecuteSqlCommand(query);

                    }
                    // call process trans 

                    ResponseResult res = Shared.TransactionProcess(Convert.ToInt32(updatedObj.I_Sls_TR_Invoice.CompCode), Convert.ToInt32(updatedObj.I_Sls_TR_Invoice.BranchCode), Sls_TR_Invoice.InvoiceID, "Quotation", "Update", db);
                    if (res.ResponseState == true)
                    {
                        updatedObj.I_Sls_TR_Invoice.TrNo = int.Parse(res.ResponseData.ToString());
                        dbTransaction.Commit();
                        return Ok(new BaseResponse(updatedObj.I_Sls_TR_Invoice));
                    }
                    else
                    {
                        dbTransaction.Rollback();
                        return Ok(new BaseResponse(HttpStatusCode.ExpectationFailed, res.ResponseMessage));
                    }
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    return Ok(new BaseResponse(HttpStatusCode.ExpectationFailed, ex.Message));
                }
            }

        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllSlsInvoice(int CompCode, int BranchCode, int CustomerId , string RFQFilter , string StartDate, string EndDate)
        {
             
             
            string s = @"SELECT   [InvoiceID] ,[TrNo]  ,[RefNO]  ,[RefTrID] , TrDate
                      ,CONVERT(varchar, TrDate, 103) as TrDateH ,[TrType] ,[IsCash] ,[SlsInvType] ,[SlsInvSrc]  ,[CashBoxID] ,[CustomerId]
                      ,[CustomerName] ,[DeliveryEndDate]  ,[SalesmanId] ,[StoreId] ,[OperationId] ,[TotalAmount]
                      ,[VatAmount] ,[VatType] ,[DiscountAmount] ,[DiscountPrc]  ,[NetAfterVat]   ,[CommitionAmount]  ,[CashAmount]
                      ,[CardAmount] ,[BankTfAmount]  ,[BankAccount] ,[TotalPaidAmount] ,[RemainAmount]  ,[Remark]
                      ,[Status] ,[IsPosted] ,[VoucherNo] ,[VoucherType] ,[CreatedAt]  ,[CreatedBy] ,[UpdatedAt] ,[UpdatedBy]
                      ,[CompCode] ,[BranchCode]  ,[DocNo] ,[DocUUID] ,[TrTime] ,[InvoiceTypeCode] ,[InvoiceTransCode]  ,[TaxNotes]
                      ,[TaxCurrencyID] ,[InvoiceCurrenyID] ,[ContractNo] ,[PurchaseorderNo] ,[GlobalInvoiceCounter] ,[PrevInvoiceHash]  ,[QRCode]
                      ,[CryptographicStamp]  ,[DeliveryDate]  ,CONVERT(varchar, DeliveryEndDate, 103) as CustomerMobileNo ,[PaymentMeansTypeCode],[CRDBReasoncode],[PaymentTerms],[PaymentTermsID],[AllowAmount],[AllowPrc]
                      ,[AllowBase]      ,[AllowVatNatID],[AllowVatPrc],[AllowAfterVat],[AllowReason],[AllowCode],[ChargeAmount],[ChargePrc],[ChargeBase],[ChargeVatNatID]
                      ,[ChargeVatPrc],[ChargeAfterVat],[ChargeReason],[ChargeCode],[ItemTotal],[ItemAllowTotal],[ItemDiscountTotal],[ItemVatTotal],[RoundingAmount]
                      FROM  I_Sls_TR_Invoice where   ";

            string condition = "";
            string Customer = "";
            string RFQ = "";

            if (CustomerId != 0 && CustomerId != null)
                Customer = " and CustomerId =" + CustomerId+" ";
            if (RFQFilter != "" && RFQFilter != null)
                RFQ =  " and RefNO ='" + RFQFilter +"' "; 


            condition = " ( CompCode = " + CompCode + " and BranchCode = " + BranchCode + " and  TrDate >='" + StartDate + "' and TrDate <= '" + EndDate + "'  " + Customer +" "+ RFQ + " )";
            condition = condition + " or ( CompCode = " + CompCode + " and BranchCode = " + BranchCode + " and  DeliveryEndDate >='" + StartDate + "' and DeliveryEndDate <= '" + EndDate + "' and TrType = '1' " + Customer + " " + RFQ + " )";

         string query = s + condition + " ORDER BY TrDate DESC , RefNO DESC";  

            var res = db.Database.SqlQuery<I_Sls_TR_Invoice>(query).ToList();
            return Ok(new BaseResponse(res));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdateInvoice(int InvoiceID,string InvDate)
        {

            //InvDate = DateTime.Now.ToString();
            string query = "update [dbo].[I_Sls_TR_Invoice] set TrType = 1 , DeliveryEndDate = '"+InvDate+"' where InvoiceID = " + InvoiceID + "";
            var res = db.Database.ExecuteSqlCommand(query);
             ResponseResult res1 = Shared.TransactionProcess(Convert.ToInt32(1), Convert.ToInt32(1), InvoiceID, "INV", "ADD", db);

            return Ok(new BaseResponse(100));
        }


        [HttpGet, AllowAnonymous]
        public IHttpActionResult DeleteInvoice(int InvoiceID)
        {

            //InvDate = DateTime.Now.ToString();
            string query = @"delete [dbo].[I_Sls_TR_InvoiceItems] where [InvoiceID]  =  "+ InvoiceID + @" 
                                  delete [dbo].[I_Sls_TR_Invoice] where [InvoiceID]  = "+ InvoiceID + " ";
            var res = db.Database.ExecuteSqlCommand(query);
            //ResponseResult res1 = Shared.TransactionProcess(Convert.ToInt32(1), Convert.ToInt32(1), InvoiceID, "INV", "ADD", db);

            return Ok(new BaseResponse(100));
        }

        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdatePurNo(int InvoiceID , string PurNo)
        {
            string query = "update [dbo].[I_Sls_TR_Invoice] set TaxNotes = '" + PurNo + "' where InvoiceID = " + InvoiceID + "";

            var res = db.Database.ExecuteSqlCommand(query);
            return Ok(new BaseResponse(100));
        }

        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllUOM()
        {
            string query = "select * from I_D_UOM ";

            var res = db.Database.SqlQuery<I_D_UOM>(query).ToList();
            return Ok(new BaseResponse(res));
        }


        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetCatgrey()
        {
            string query = "select * from I_D_Category ";

            var res = db.Database.SqlQuery<I_D_Category>(query).ToList();
            return Ok(new BaseResponse(res));
        }

        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetI_ItemFamily()
        {
            string query = "select * from I_ItemFamily ";

            var res = db.Database.SqlQuery<I_ItemFamily>(query).ToList();
            return Ok(new BaseResponse(res));
        }

        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetI_Items()
        {
            string query = "select * from I_Item ";

            var res = db.Database.SqlQuery<I_Item>(query).ToList();
            return Ok(new BaseResponse(res));
        }


        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllStock()
        {

            string query = "select * from I_D_Category "; 
            var Category = db.Database.SqlQuery<I_D_Category>(query).ToList();

            //-------------------------------------------------------------------

            string query_2 = "select * from I_ItemFamily "; 
            var ItemFamily = db.Database.SqlQuery<I_ItemFamily>(query_2).ToList();

            //-------------------------------------------------------------------

            string query_3 = "select * from IQ_GetItemStoreInfo "; 
            var Items = db.Database.SqlQuery<IQ_GetItemStoreInfo>(query_3).ToList();


            AllItems Model = new AllItems();

            Model.I_D_Category = Category;
            Model.I_ItemFamily = ItemFamily;
            Model.I_Item = Items;

            return Ok(new BaseResponse(Model));
        }




        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetCustomer(int id)
        {
            string query = "select * from Customer where  CustomerId = " + id + "";

            var res = db.Database.SqlQuery<Customer>(query).ToList();
            return Ok(new BaseResponse(res));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllCustomer()
        {
            string query = "select * from Customer ";

            var res = db.Database.SqlQuery<Customer>(query).ToList();
            return Ok(new BaseResponse(res));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult InsertCustomer(string NAMEA, string NAMEE, string EMAIL, string Address_Street, Boolean Isactive, string REMARKS, string CREATED_BY, string CREATED_AT, string Mobile, string Telephone)
        {
            int active = 0;
            if (Isactive == true)
            { active = 1; }
            string query = "INSERT INTO [dbo].[Customer] (NAMEA,NAMEE,EMAIL,REMARKS,Isactive,Address_Street,MOBILE,TEL) VALUES  ('" + NAMEA + "','" + NAMEE + "','" + EMAIL + "','" + REMARKS + "'," + active + ",'" + Address_Street + "','" + Mobile + "','" + Telephone + "')";
            db.Database.ExecuteSqlCommand(query);
            return Ok(new BaseResponse(100));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdateCustomer(string NAMEA, string NAMEE, string EMAIL, string Address_Street, Boolean Isactive, string REMARKS, string CREATED_BY, string CREATED_AT, int CustomerId, string Mobile, string Telephone)
        {
            int active = 0;
            if (Isactive == true)
            { active = 1; }
            string query = "update [dbo].[Customer] set  NAMEA ='" + NAMEA + "' ,NAMEE = '" + NAMEE + "',EMAIL = '" + EMAIL + "',REMARKS = '" + REMARKS + "',Isactive = " + active + ",Address_Street= '" + Address_Street + "', MOBILE = '" + Mobile + "',TEL = '" + Telephone + "'  where CustomerId = " + CustomerId + "";
            db.Database.ExecuteSqlCommand(query);
            return Ok(new BaseResponse(100));
        }


        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetSlsInvoiceItem(int invoiceID)
        {

            var res = db.I_Sls_TR_InvoiceItems.Where(x => x.InvoiceID == invoiceID).ToList();
            return Ok(new BaseResponse(res));
        }
         
        [HttpPost, AllowAnonymous]
        public IHttpActionResult AddUsers([FromBody] SlsInvoiceMasterDetails updatedObj)
        {
           string CreatedAt = DateTime.Now.ToString();
            var QUERY = "";
            var res = db.Database.ExecuteSqlCommand(QUERY);
            return Ok(new BaseResponse(res));
        }


        [HttpPost, AllowAnonymous]
        public IHttpActionResult GetCatItem(int CompCode)
        {
            string CreatedAt = DateTime.Now.ToString();
            var QUERY = "select * from I_D_Category where CompCode = "+ CompCode + "";
            var res = db.Database.ExecuteSqlCommand(QUERY);
            return Ok(new BaseResponse(res));
        }


        [HttpGet, AllowAnonymous] 
        public IHttpActionResult ExpensMony(decimal Amount, string Desc, string TrDate , string ExpenseI_By,string Remarks, string Shift, string ExtraField)
        {
            
            string query = "insert into [dbo].[Expense] values('"+ TrDate + "','1',N'"+ Desc + "',N'" + Desc + "',"+ Amount + " ,N'" + ExpenseI_By + "' ,N'" + Remarks + "' ,N'" + Shift + "' ,N'" + ExtraField + "')"; 
            var res = db.Database.ExecuteSqlCommand(query);
            return Ok(new BaseResponse(100));
        }
    }
}
