export const getHierarchyData = () => {
    try{
        // debugger;
        let hierarchyData=localStorage.getItem('hierarchy');
        return JSON.parse(hierarchyData);
    }
    catch(error){
        console.error("getHierarchyData",error);
        return null;
    }
}
export const saveHierarchyData = (newHierarchy) => {
    try{
        // debugger;
        localStorage.setItem('hierarchy', JSON.stringify(newHierarchy));
       return true;
    }
    catch(error){
        console.error("getHierarchyData",error);
        return false;
    }
}