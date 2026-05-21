const useMCollectCategoryTypes = (selectedCategory,categoriesandTypes) => {
let categorieTypes = [];
categoriesandTypes && selectedCategory && categoriesandTypes?.MdmsRes?.BillingService?.BusinessService?.filter((ob) => ob.code.split(".")[0] === selectedCategory.code.split(".")[0]).map((type) =>{
    categorieTypes.push({...type, i18nkey: type.businessService ? type.businessService.split(".").slice(1).join(".") : type.code})
});
return categorieTypes;
};


export default useMCollectCategoryTypes;