using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Inv.DAL.Domain;
using Inv.API.Models;
using Inv.API.Models.CustomEntities;

namespace Inv.API.Models.CustomModel
{
    public class ITEM_ITEMYEAR
    {
        //public ORDER_Master Sls_Ivoice { get; set; }
        //public List<Stok_ORDER_DELIVERY> Sls_InvoiceDetail { get; set; } 
         
        public List<I_Item> I_Item { get; set; }
        public List<I_ItemYear> I_ItemYear { get; set; }
    }
}