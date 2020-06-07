import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {FiUpload} from 'react-icons/fi'

import './styles.css'

interface Props{
  onFileUploaded: ( file: File) => void ;
}
const Dropzone: React.FC<Props> = ({onFileUploaded}) => {
  const[selecteFileUrl, setSelecteFileUrl] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const fileURl = URL.createObjectURL(file);
    setSelecteFileUrl(fileURl);
    onFileUploaded(file);
  }, [onFileUploaded])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />

      { selecteFileUrl ? <img src={selecteFileUrl} alt="Point thumnail"/> :
       (      
        <p>
          <FiUpload/>
          Imagem do establecimento
        </p>
      )}

    </div>
  )
}

export default Dropzone;