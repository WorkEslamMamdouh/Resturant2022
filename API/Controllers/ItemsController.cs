using Inv.API.Models;
using Inv.API.Tools;
using Inv.BLL.Services.IItems;
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
using Newtonsoft.Json;  
using System.Data; 

namespace Inv.API.Controllers
{
    public class ItemsController : BaseController
    {
        private readonly ItemsService ItemsService;
        private readonly G_USERSController UserControl;

        public ItemsController(ItemsService _IItemsService, G_USERSController _Control)
        {
            this.ItemsService = _IItemsService;
            this.UserControl = _Control;
        } 

        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllCategory(int CompCode)
        { 
            var res = db.Database.SqlQuery<I_D_Category>("select * from I_D_Category where CompCode = " + CompCode + "").ToList(); 
            return Ok(new BaseResponse(res));
        } 
        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllItemFamily(int CompCode)
        { 
            var res = db.Database.SqlQuery<I_ItemFamily>("select * from I_ItemFamily where CompCode = " + CompCode + "").ToList();
            return Ok(new BaseResponse(res));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult GetAllItem(int CompCode)
        {
            var res = db.Database.SqlQuery<IQ_GetItemStoreInfo>("select * from IQ_GetItemStoreInfo where CompCode = " + CompCode + "").ToList();
            return Ok(new BaseResponse(res));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdateCategory(string data)
        {
            List<I_D_Category> Categorylist = JsonConvert.DeserializeObject<List<I_D_Category>>(data);


            var insertedInvoiceItems = Categorylist.Where(x => x.StatusFlag == 'i').ToList();
            var updatedInvoiceItems = Categorylist.Where(x => x.StatusFlag == 'u').ToList();
            var deletedInvoiceItems = Categorylist.Where(x => x.StatusFlag == 'd').ToList(); 

            foreach (var item in insertedInvoiceItems)
            {
                ItemsService.InsertCategory(item);
            }
            foreach (var item in updatedInvoiceItems)
            {
                ItemsService.UpdateCategory(item);
            }
            foreach (var item in deletedInvoiceItems)
            {
                ItemsService.DeleteCategory(item.CatID);
            }
 

            return Ok(new BaseResponse(11));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdateItemFamily(string data)
        {
            List<I_ItemFamily> ItemFamilylist = JsonConvert.DeserializeObject<List<I_ItemFamily>>(data);


            var insertedInvoiceItems = ItemFamilylist.Where(x => x.StatusFlag == 'i').ToList();
            var updatedInvoiceItems = ItemFamilylist.Where(x => x.StatusFlag == 'u').ToList();
            var deletedInvoiceItems = ItemFamilylist.Where(x => x.StatusFlag == 'd').ToList(); 

            foreach (var item in insertedInvoiceItems)
            {
                ItemsService.InsertFamily(item);
            }
            foreach (var item in updatedInvoiceItems)
            {
                ItemsService.UpdateFamily(item);
            }
            foreach (var item in deletedInvoiceItems)
            {
                ItemsService.DeleteFamily(item.ItemFamilyID);
            }
 

            return Ok(new BaseResponse(11));
        }
        [HttpGet, AllowAnonymous]
        public IHttpActionResult UpdateItems(string data)
        {
            ITEM_ITEMYEAR Customlist = JsonConvert.DeserializeObject<ITEM_ITEMYEAR>(data);

                   

            var inserteItems = Customlist.I_Item.Where(x => x.StatusFlag == 'i').ToList();
            var inserteItemyear = Customlist.I_ItemYear.Where(x => x.StatusFlag == 'i').ToList();
            var updatedtems = Customlist.I_Item.Where(x => x.StatusFlag == 'u').ToList();
            var updatedtemsYear = Customlist.I_ItemYear.Where(x => x.StatusFlag == 'u').ToList();
            var deletedtems = Customlist.I_Item.Where(x => x.StatusFlag == 'd').ToList();

            int i = 0;
            foreach (var item in inserteItems)
            { 
                var items=  ItemsService.Insert(item);
                inserteItemyear[i].ItemID = items.ItemID;
                ItemsService.InsertItemyear(inserteItemyear[i]); 
                i++;

                Shared.TransactionProcess(Convert.ToInt32(1), 1, items.ItemID, "ItemDef", "Add", db);

            }
            int o = 0; ;
            foreach (var item in updatedtems)
            {
                var items = ItemsService.Update(item); 
                ItemsService.UpdateItemYear(updatedtemsYear[o]);

                Shared.TransactionProcess(Convert.ToInt32(1), 1, items.ItemID, "ItemDef", "update", db);
            }
            foreach (var item in deletedtems)
            {
                ItemsService.Delete(item.ItemID);
            }
              

            return Ok(new BaseResponse(11));
        }


    }
}
