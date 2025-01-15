import axios from "../../axiosConfig";
import { S3_BUCKET_NAME } from "../../utils/consts";

export  const validateImageName = (name) => {
    const regex = /^(set \d+|object_overview)\.(jpg|jpeg|png)$/;
    return regex.test(name);
};
export const formatDate = (date) => {
    if (date.length < 9) { return date; }
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year.slice(2)}`;
};
export const fetchExistingDates = async (hierarchy,type) => {
    try {
        const response = await axios.get('/api/folder/list-dates', {
            params: {
                type,
                bucketName: S3_BUCKET_NAME,
                client: hierarchy.client,
                project: hierarchy.project,
                floor: hierarchy.floor,
                element: hierarchy.element,
                object: hierarchy.object,
            },
        });
        return response.data.dates;
    } catch (error) {
        console.error('Error fetching existing dates', error);
    }
};

export const fetchExistingFiles = async (BUCKET_NAME,hierarchy,date,typeUpload) => {
    try {
        const response = await axios.get('/api/folder/list-files', {
            params: {
                bucketName: BUCKET_NAME,
                client: hierarchy.client,
                project: hierarchy.project,
                floor: hierarchy.floor,
                element: hierarchy.element,
                object: hierarchy.object,
                date,
                typeUpload
            },
        });
        return response.data.files;
    } catch (error) {
        console.error('Error fetching existing files', error);
    }
};
export const  sleep=(ms)=> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
