import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { getImageKeys, postThumbnails, fetchImageBlob, deleteImage } from '../../api/folderApi';

const ImageGallery = ({ bucketName, projectName,externalKeys = [] }) => {
    const [imageKeys, setImageKeys] = useState([]);
    const [thumbnailUrls, setThumbnailUrls] = useState({});
    const [loadingKeys, setLoadingKeys] = useState([]);
    const observer = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);

    useEffect(() => {
        const fetchImageKeys = async () => {
            debugger;
            if (externalKeys.length > 0) {
                setImageKeys(externalKeys);
                setLoadingKeys(externalKeys.slice(0, 5)); // Load first 5 thumbnails from external keys
            }
            else if(imageKeys.length ===0) {
                try {
                    const keys = await getImageKeys(bucketName, projectName)
                    setImageKeys(keys);
                    setLoadingKeys(keys.slice(0, 5)); // Initially load the first 5 thumbnails
                } catch (error) {
                    console.error('Error fetching image keys', error);
                }
            }

        };

        fetchImageKeys();
    }, [bucketName, projectName,externalKeys]);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const key = entry.target.getAttribute('data-key');
                    if (!thumbnailUrls[key] && !loadingKeys.includes(key)) {
                        setLoadingKeys((prevKeys) => [...prevKeys, key]);
                    }
                }
            });
        });

        const elements = document.querySelectorAll('.thumbnail');
        elements.forEach((el) => observer.current.observe(el));

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [imageKeys, thumbnailUrls, loadingKeys]);

    useEffect(() => {
        const loadNextThumbnails = async () => {
            const keysToLoad = loadingKeys.slice(0, 5); // Load thumbnails in batches of 5
            if (keysToLoad.length > 0) {
                await loadThumbnails(keysToLoad);
                setLoadingKeys((prevKeys) => prevKeys.slice(5)); // Remove the loaded keys from the list
            }
        };

        if (loadingKeys.length > 0) {
            const timer = setTimeout(loadNextThumbnails, 50); // 0.05-second delay between batches
            return () => clearTimeout(timer);
        }
    }, [loadingKeys]);

    const loadThumbnails = async (keys) => {
        try {
            const thumbnailData = await postThumbnails(keys, bucketName)
            const newThumbnailUrls = {};
            thumbnailData.forEach(({ key, url }) => {
                newThumbnailUrls[key] = url;
            });
            setThumbnailUrls((prevUrls) => ({
                ...prevUrls,
                ...newThumbnailUrls,
            }));
        } catch (error) {
            console.error(`Error fetching thumbnails`, error);
        }
    };

    const handleImageClick = async (key) => {
        try {
            const data = await fetchImageBlob(key, bucketName)
            const url = URL.createObjectURL(data);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error fetching full-sized image', error);
        }
    };

    const openDeleteModal = (e, key) => {
        e.stopPropagation(); // Prevent triggering onDoubleClick event
        setKeyToDelete(key);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setKeyToDelete(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = async () => {
        try {
            await deleteImage(keyToDelete, bucketName)
            setImageKeys(imageKeys.filter((key) => key !== keyToDelete));
            setThumbnailUrls((prevUrls) => {
                const updatedUrls = { ...prevUrls };
                delete updatedUrls[keyToDelete];
                return updatedUrls;
            });
            closeDeleteModal();
        } catch (error) {
            console.error(`Error deleting image ${keyToDelete}`, error);
            closeDeleteModal();
        }
    };

    return (
        <div className="container">
            <div className="row">
                <h4>double click image to open in new window</h4>
                {imageKeys.map((key, i) => (
                    <div key={key} className="col-md-3 col-sm-6 mb-3">
                        <div data-key={key} className="thumbnail" onDoubleClick={() => handleImageClick(key)}>
                            <h3>{i + 1}
                                <button className="btn btn-danger" onClick={(e) => openDeleteModal(e, key)}>Delete
                                </button>
                            </h3>

                            {thumbnailUrls[key]? <img
                                data-tooltip-id={key} data-tooltip-content={key}
                                title={key}
                                src={thumbnailUrls[key] || 'loading-thumbnail.jpg'}
                                alt="Thumbnail"
                                onError={(e) => {
                                    e.target.src = ''; // Fallback thumbnail image
                                }}
                                className="img-fluid"
                            /> : <div>
                                still loading
                            </div>}
                        </div>
                        <Tooltip id={key} />
                    </div>
                ))}
            </div>
            {showDeleteModal && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="close" onClick={closeDeleteModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete {keyToDelete}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
