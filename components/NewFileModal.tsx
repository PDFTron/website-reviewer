import { useBoolean, useDisclosure } from "@chakra-ui/hooks"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Text
} from "@chakra-ui/react"
import { useContext, useRef } from "react"
import CollabClient from "../context/CollabClient";
import WebViewerHTML from "../context/WebViewerHTML";
import dayjs from 'dayjs';
import { useRouter } from "next/dist/client/router";
import WebViewer from "../context/WebViewer";

export default function NewFileModal() {

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setLoading] = useBoolean();


  const urlRef = useRef<HTMLInputElement>();
  const nameRef = useRef<HTMLInputElement>();
  const widthRef = useRef<HTMLInputElement>();
  const router = useRouter();

  const htmlInstance = useContext(WebViewerHTML)
  const client = useContext(CollabClient);
  const instance = useContext(WebViewer);

  const submit = async () => {

    setLoading.on();

    const url = urlRef.current.value;
    const name = nameRef.current.value;
    const width = widthRef.current.value;

    const result = await fetch(`${process.env.NEXT_PUBLIC_DOCUMENT_API_BASE_URL}/add`, {
      method: 'post',
      body: JSON.stringify({
        url,
        width
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const {
      url: finalUrl,
      height,
      id
    } = await result.json();

    instance.instance.docViewer.one('documentLoaded', async () => {
      await client.loadSession(id, {
        isPublic: true,
        filename: name
      })

      router.push(`/document/${id}`)

      setLoading.off();
      onClose();
    })

    htmlInstance.loadHTMLPage({
      url: finalUrl,
      width: Number(width),
      height
    })
  }


  const urlBlurred = (value) => {
    const nameValue = nameRef.current.value;
    if (nameValue !== '') {
      return;
    }

    try {
      const url = new URL(value);
      const host = url.host.replace('www.', '');
  
      const date = dayjs().format('MMM D, YYYY h:mmA')
  
      const newName = `${host} - ${date}`;
      nameRef.current.value = newName;
    } catch (e) {
      // probably invalid URL - OK
    }

  }

  return (
    <>
      <Button onClick={onOpen} bg='yellow' color='blue.900'>New file</Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review a new website</ModalHeader>
          <ModalCloseButton />
          <ModalBody>

            <Text pb='5px'>Enter the URL</Text>
            <Input ref={urlRef} onBlur={(e) => urlBlurred(e.target.value)}/>
            
            <Text mt='20px' pb='5px'>Enter a name for this document</Text>
            <Input ref={nameRef} />
            
            <Text mt='20px' pb='5px'>Enter a width to view the document at</Text>
            <Input type='number' min={100} defaultValue='1200' ref={widthRef}/>

            <Button isLoading={loading} my='20px' bg='blue.500' color='white' onClick={submit} >Submit</Button>
          </ModalBody>

        </ModalContent>
      </Modal>
    </>

  )

}