import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import IconExport from '../../assets/icon-export';
import IconRemove from '../../assets/icon-remove';
import IconRotate from '../../assets/icon-rotate';
import PdfLogo from '../../assets/pdf_logo.png';
import { LoadingComponent } from '../loading';
import { isFileAnImage } from '../../logic/utilities';

const maxFilesCount = 10;

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
    fileName: {
        backgroundColor: '#CB0606',
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        left: '18%',
        maxWidth: '64%',
        overflowWrap: 'break-word',
        position: 'absolute',
        textAlign: 'center',
        top: 80,
        width: '64%',
        zIndex: 10
    },
    uploaderContainer: {
        border: '2px dashed #9DA0A3',
        background: 'none',
        cursor: 'pointer',
        marginTop: 4,
        marginBottom: 8,
        height: 100
    }
});

function DragNDropFileComponent({ files = [], onChange, hasFiles }) {
    const [loadingImages, setLoadingImages] = useState(hasFiles);

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);

    const {
        getRootProps,
        getInputProps,
        rootRef,
        inputRef,
        acceptedFiles
    } = useDropzone();

    const openLightbox = useCallback((_, { index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    useEffect(() => {
        let newFiles = [];
        for (let i = 0; i < acceptedFiles.length; i++) {
            const fileName = acceptedFiles[i].name;
            if (files.findIndex(f => f.name === fileName) < 0) {
                newFiles.push(acceptedFiles[i]);
            }
        }
        newFiles = [...files, ...newFiles];
        if (newFiles.length > maxFilesCount) {
            newFiles = newFiles.slice(-maxFilesCount);
        }
        onChange && onChange(newFiles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acceptedFiles]);

    const photos = files.map(file => {
        let thumb;
        let isImage = true;
        const src = file.publicUrl || URL.createObjectURL(file);
        if (!isFileAnImage(file)) {
            thumb = PdfLogo;
            isImage = false;
        } else {
            thumb = src;
            if (file.publicUrl) {
                thumb = file.thumb;
            }
        }
        return {
            src,
            thumb,
            width: 1,
            height: 1,
            rotate: file.rotate || 0,
            name: file.name,
            isImage
        };
    });

    const removeFile = (src, name) => {
        const filteredFiles = files.filter(
            f =>
                (f.publicUrl && f.publicUrl !== src) ||
                (!f.publicUrl && f.name !== name)
        );

        onChange && onChange(filteredFiles);
    };

    const rotateImage = src => {
        const fileIndex = files.findIndex(
            f => f.publicUrl && f.publicUrl === src
        );
        if (fileIndex < 0) {
            return null;
        }
        files[fileIndex].rotate = (files[fileIndex].rotate || 0) - 90;
        onChange && onChange(files);
    };

    const imageRenderer = ({
        index,
        photo: { isImage, ...photo },
        onClick
    }) => {
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
                {isImage && (
                    <IconRotate
                        width={40}
                        className={css(styles.imgButton)}
                        style={{ top: 5, left: 5 }}
                        color="red"
                        onClick={() => rotateImage(photo.src)}
                    />
                )}
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
                    onClick={e =>
                        isImage
                            ? onClick(e, { index })
                            : window.open(photo.src, '_blank')
                    }
                    onLoad={() => setLoadingImages(false)}
                    style={{
                        transform: `rotate(${photo.rotate || 0}deg)`,
                        maxHeight: 256,
                        maxWidth: 256
                    }}
                />
                {photo.name && !isImage && (
                    <span className={css(styles.fileName)}>
                        {photo.name.split('.')[0]}
                    </span>
                )}
            </div>
        );
    };

    return (
        <Column>
            <Column>
                <Column
                    vertical="center"
                    horizontal="center"
                    {...getRootProps()}
                    className={css(styles.uploaderContainer)}
                    ref={rootRef}
                >
                    <input ref={inputRef} {...getInputProps()} />
                    Drag 'n' drop some files here, or click to select files
                </Column>
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
