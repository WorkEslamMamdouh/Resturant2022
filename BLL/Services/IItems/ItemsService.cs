using Inv.DAL.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Inv.BLL.Services.IItems
{
    public interface ItemsService
    {
        I_Item GetById(int id);
        I_D_Category InsertCategory(I_D_Category entity);
        I_D_Category UpdateCategory(I_D_Category entity);
        void DeleteCategory(int id);
        I_ItemYear  UpdateItemYear(I_ItemYear entity);
        I_ItemYear InsertItemyear(I_ItemYear entity);
        I_ItemFamily InsertFamily(I_ItemFamily entity);
        I_ItemFamily UpdateFamily(I_ItemFamily entity);
        void DeleteFamily(int id);
        
        I_Item Insert(I_Item entity);
        I_Item Update(I_Item entity);
        void Delete(int id); 
        void UpdateList(List<I_Item> Lstservice);
         
    }
}
