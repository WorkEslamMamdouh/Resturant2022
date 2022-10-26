using Inv.BLL.Services.IItems;
using Inv.DAL.Domain;
using Inv.DAL.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Inv.BLL.Services.II_Item
{
 public  class II_ItemService: ItemsService
    {
        private readonly IUnitOfWork unitOfWork;

        public II_ItemService(IUnitOfWork _unitOfWork)
        {
            this.unitOfWork = _unitOfWork;
        }
        public I_Item GetById(int id)
        {
            return unitOfWork.Repository<I_Item>().GetById(id);
        }


        public I_D_Category InsertCategory(I_D_Category entity)
        {
            var Item = unitOfWork.Repository<I_D_Category>().Insert(entity);
            unitOfWork.Save();
            return Item;
        }
        public I_D_Category UpdateCategory(I_D_Category entity)
        {

            var Item = unitOfWork.Repository<I_D_Category>().Update(entity);
            unitOfWork.Save();
            return Item;
        }
        public void DeleteCategory(int id)
        {
            unitOfWork.Repository<I_D_Category>().Delete(id);
            unitOfWork.Save();
        } 

        public I_ItemFamily InsertFamily(I_ItemFamily entity)
        {
            var Item = unitOfWork.Repository<I_ItemFamily>().Insert(entity);
            unitOfWork.Save();
            return Item;
        }
        public I_ItemFamily UpdateFamily(I_ItemFamily entity)
        {

            var Item = unitOfWork.Repository<I_ItemFamily>().Update(entity);
            unitOfWork.Save();
            return Item;
        }
        public void DeleteFamily(int id)
        {
            unitOfWork.Repository<I_ItemFamily>().Delete(id);
            unitOfWork.Save();
        } 

        public I_ItemYear InsertItemyear(I_ItemYear entity)
        {
            var Item = unitOfWork.Repository<I_ItemYear>().Insert(entity);
            unitOfWork.Save();
            return Item;
        }
        public I_ItemYear UpdateItemYear(I_ItemYear entity)
        {

            var Item = unitOfWork.Repository<I_ItemYear>().Update(entity);
            unitOfWork.Save();
            return Item;
        }
        public I_Item Insert(I_Item entity)
        {
            var Item = unitOfWork.Repository<I_Item>().Insert(entity);
            unitOfWork.Save();
            return Item;
        }
        public I_Item Update(I_Item entity)
        {

            var Item = unitOfWork.Repository<I_Item>().Update(entity);
            unitOfWork.Save();
            return Item;
        }
        public void Delete(int id)
        {
            unitOfWork.Repository<I_Item>().Delete(id);
            unitOfWork.Save();
        }
        public void UpdateList(List<I_Item> entityList)
        {
            unitOfWork.Repository<I_Item>().Update(entityList);
            unitOfWork.Save();

        }
         
    }
}
