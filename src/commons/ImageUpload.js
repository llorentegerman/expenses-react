import React, { useCallback, useState } from 'react';
import ImageUploader from 'react-images-upload';
import { Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import IconRemove from '../assets/icon-remove';
import { LoadingComponent } from './InitializingComponent';

const styles = StyleSheet.create({
    photoContainer: {
        cursor: 'pointer',
        margin: 2,
        position: 'relative'
    },
    removeButton: {
        borderRadius: 50,
        position: 'absolute',
        padding: 3,
        top: 5,
        right: 5,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.8,
        ':hover': {
            opacity: 0.5,
            borderRadius: '4px',
            backgroundColor: 'white'
        }
    },
    uploaderContainer: {
        ':nth-child(n) > div > div': {
            border: '2px dashed #9DA0A3',
            background: 'none'
        }
    }
});

function DragNDropFileComponent({ files = [], onChange, hasFiles }) {
    const [loadingImages, setLoadingImages] = useState(hasFiles);

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const onDrop = (pictureFiles, pictureDataURLs) => {
        pictureFiles = [...files, ...pictureFiles];
        if (pictureFiles.length > 2) {
            pictureFiles = pictureFiles.slice(-2);
        }
        onChange && onChange(pictureFiles);
    };

    const photos = files.map((file, index) => {
        const src = file.url || URL.createObjectURL(file);
        let thumb = src;
        if (file.url) {
            thumb = file.thumb;
        }
        return {
            src,
            thumb,
            width: 1,
            height: 1
        };
    });

    const removeFile = src => {
        const filteredFiles = files.filter(f => f.url && f.url !== src);
        onChange && onChange(filteredFiles);
    };

    const imageRenderer = ({ index, photo, onClick, ...others }) => {
        return (
            <div
                key={`image-${index}`}
                className={css(styles.photoContainer)}
                style={{
                    height: photo.height,
                    width: photo.width
                }}
            >
                <IconRemove
                    width={40}
                    className={css(styles.removeButton)}
                    color="red"
                    onClick={() => removeFile(photo.src)}
                />
                <img
                    alt={photo.title}
                    {...photo}
                    src={photo.thumb}
                    onError={e => (e.target.src = photo.src)}
                    onClick={e => onClick(e, { index })}
                    onLoad={() => setLoadingImages(false)}
                />
            </div>
        );
    };

    return (
        <Column>
            <Column className={css(styles.uploaderContainer)}>
                <ImageUploader
                    withIcon={true}
                    buttonText="Subir imagenes"
                    label="Maximo 2 archivos. Tamaño maximo: 5mb"
                    onChange={onDrop}
                    imgExtension={['.jpg', '.gif', '.png', '.gif', '.jpeg']}
                    maxFileSize={5242880}
                />
            </Column>
            <LoadingComponent loading={loadingImages}>
                <Gallery
                    photos={photos}
                    onClick={openLightbox}
                    renderImage={imageRenderer}
                />
            </LoadingComponent>
            <ModalGateway>
                {viewerIsOpen ? (
                    <Modal
                        onClose={closeLightbox}
                        styles={{
                            dialog: base => ({
                                ...base,
                                zIndex: 1230
                            }),
                            positioner: base => ({
                                ...base,
                                zIndex: 1220
                            }),
                            blanket: base => ({
                                ...base,
                                zIndex: 1210
                            })
                        }}
                    >
                        <Carousel
                            isFullscreen={true}
                            isModal={true}
                            currentIndex={currentImage}
                            views={photos.map(x => ({
                                ...x,
                                srcset: x.srcSet,
                                caption: x.title
                            }))}
                        />
                    </Modal>
                ) : null}
            </ModalGateway>
        </Column>
    );
}

export default DragNDropFileComponent;
