using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Inv.DAL.Domain;
using Inv.API.Models;
using Inv.API.Models.CustomEntities;
using System;

namespace Inv.API.Models.CustomModel
{
    public class AllItems : SecurityClass
    {
        
        public List<I_D_Category> I_D_Category { get; set; }
        public List<I_ItemFamily> I_ItemFamily { get; set; }
        public List<IQ_GetItemStoreInfo> I_Item { get; set; }
    }
}