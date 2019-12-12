import React, { useCallback, useState, useRef } from 'react';
import ImageUploader from 'react-images-upload';
import { Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import IconExport from '../assets/icon-export';
import IconRemove from '../assets/icon-remove';
import IconRotate from '../assets/icon-rotate';
import { LoadingComponent } from './InitializingComponent';

const maxFilesCount = 3;

const styles = StyleSheet.create({
    photoContainer: {
        cursor: 'pointer',
        margin: 2,
        maxHeight: 256,
        maxWidth: 256,
        position: 'relative'
    },
    imgButton: {
        alignItems: 'center',
        borderRadius: 50,
        cursor: 'pointer',
        display: 'flex',
        opacity: 0.8,
        padding: 3,
        position: 'absolute',
        zIndex: 1,
        ':hover': {
            backgroundColor: 'white',
            borderRadius: '4px',
            opacity: 0.5
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

    const refUploadContainer = useRef();

    const openLightbox = useCallback((_, { index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const onDrop = pictureFiles => {
        let newFiles = [];
        for (let i = 0; i < pictureFiles.length; i++) {
            const fileName = pictureFiles[i].name;
            if (files.findIndex(f => f.name === fileName) < 0) {
                newFiles.push(pictureFiles[i]);
            }
        }
        newFiles = [...files, ...newFiles];
        if (newFiles.length > maxFilesCount) {
            newFiles = newFiles.slice(-maxFilesCount);
        }
        onChange && onChange(newFiles);
    };

    const photos = files.map(file => {
        const src = file.url || URL.createObjectURL(file);
        let thumb = src;
        if (file.url) {
            thumb = file.thumb;
        }
        return {
            src,
            thumb,
            width: 1,
            height: 1,
            rotate: file.rotate || 0,
            name: file.name
        };
    });

    const removeFile = (src, name) => {
        const filteredFiles = files.filter(
            f => (f.url && f.url !== src) || (!f.url && f.name !== name)
        );

        refUploadContainer.current.state.files = refUploadContainer.current.state.files.filter(
            f => (f.url && f.url !== src) || (!f.url && f.name !== name)
        );
        onChange && onChange(filteredFiles);
    };

    const rotateImage = src => {
        const fileIndex = files.findIndex(f => f.url && f.url === src);
        files[fileIndex].rotate = (files[fileIndex].rotate || 0) - 90;
        onChange && onChange(files);
    };

    const imageRenderer = ({ index, photo, onClick }) => {
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
                    className={css(styles.imgButton)}
                    style={{ top: 5, right: 5 }}
                    color="red"
                    onClick={() => removeFile(photo.src, photo.name)}
                />
                <IconRotate
                    width={40}
                    className={css(styles.imgButton)}
                    style={{ top: 5, left: 5 }}
                    color="red"
                    onClick={() => rotateImage(photo.src)}
                />
                <IconExport
                    width={40}
                    className={css(styles.imgButton)}
                    style={{ bottom: 5, left: 5 }}
                    color="red"
                    onClick={() => window.open(photo.src, '_blank')}
                />
                <img
                    alt={photo.title}
                    {...photo}
                    src={photo.thumb}
                    onError={e => (e.target.src = photo.src)}
                    onClick={e => onClick(e, { index })}
                    onLoad={() => setLoadingImages(false)}
                    style={{
                        transform: `rotate(${photo.rotate || 0}deg)`,
                        maxHeight: 256,
                        maxWidth: 256
                    }}
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
                    label={`Maximo ${maxFilesCount} archivos. Tamaño maximo: 5mb`}
                    onChange={onDrop}
                    imgExtension={['.jpg', '.gif', '.png', '.gif', '.jpeg']}
                    maxFileSize={5242880}
                    ref={refUploadContainer}
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
