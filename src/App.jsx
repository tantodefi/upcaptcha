import { useEffect, useState, useRef } from 'react'
import Web3 from 'web3'
import { ERC725 } from '@erc725/erc725.js'
import { CheckIcon, ChromeIcon, BraveIcon } from './components/icons'
import upcaptchaLogo from '/upcaptcha.svg'
import imgUrl from "/tantodefi_UPcardQR.jpg"
import toast, { Toaster } from 'react-hot-toast'
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'
import Loading from './components/LoadingSpinner'
import styles from './App.module.scss'

const provider = window.luksos
const web3 = new Web3(provider)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState()
  const [isUPinstalled, setIsUPinstalled] = useState(window.lukso || false)
  const checkboxRef = useRef()

  /**
   * Fetch Universal Profile
   * @param {address} addr
   * @returns
   */
  const fetchProfile = async (addr) => {
    const erc725js = new ERC725(lsp3ProfileSchema, addr, provider, {
      ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
    })
    return await erc725js.fetchData('LSP3Profile')
  }

  /**
   * Connect wallet
   */
  const connectWallet = async () => {
    if (!checkboxRef.current.checked) return false
    const loadingToast = toast.loading('Loading...')

    try {
      await web3.eth.requestAccounts()
      const accounts = await web3.eth.getAccounts()
      console.log(accounts)
      // TODO: Make the canvas here invisible/off screen and then also on each page load console.log all the saved UPs into console to easy inspect who has connected
      // consider using https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage to track if client has already completed captcha and then keep button selected (example use-case = whitelist) https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage
      const canvas = document.getElementById("b");
      const ctx = canvas.getContext("2d");
      ctx.fillText(accounts, 10, 10) 
      // Call fetch func
      // TODO: Once successfully connected 1) change the the color of matrix rain to be pink 2) var matrix string in <canvas></canvas> to be UPaddress 3) keep a persistent log of the connected UPs somewhere invisible on canvas https://stackoverflow.com/questions/64628974/javascript-troubleshooting-in-canvas-using-console-log
      fetchProfile(accounts[0]).then((res) => {
        toast.dismiss(loadingToast)
        toast.success(`Got the data`, { icon: '🆙' })
        toast.success(`Data printed in the console`, { icon: '🦄' })

        console.log(res)
        setProfile(res)
        toast(`Welcome ${res.value.LSP3Profile.name}!`)
      })
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(error.message)
      checkboxRef.current.checked = !checkboxRef.current.checked
    }
  }

  useEffect(() => {
    setIsLoading(false)
  })

  if (!isUPinstalled)
    return (
      <>
        <h3>You need to install UP extension</h3>
        <UPExtension />
      </>
    )

  return (
    <>
      <Toaster />

      {isLoading && <Loading />}

      <div className={styles.container}>
      <h1>upCanvas</h1>
      <imgUrl src={imgUrl} alt="tantodefi UPcard QR" />
      <h2>by tantodefi</h2>
      <h3>Generate animations on top of LUKSO nfts</h3>
        <CheckIcon />
        <h3>Solve upCapcha Anon</h3>
        <p className={styles.description}>
          upCaptcha by using Universal Profile Public Data (UPPD) confirms visitors are real without the data privacy concerns or spending time on solving puzzles.
        </p>
        <div className={styles.captcha}>
          <div className={styles.captcha__item}>
            <input type="checkbox" name="" id="" onClick={() => connectWallet().catch()} ref={checkboxRef} />
          </div>
          <div className={styles.captcha__item}>Continue with UP</div>
          <div className={styles.captcha__item}>
            <a href="./" target="_blank">
              <img src={upcaptchaLogo} className="logo react" alt="React logo" />
            </a>
            <b>upCaptcha</b>
            <div className={styles.captcha__itemActions}>
              <a href="#" onClick={() => toast(`TODO`, { icon: '🔃' })}>
                Privacy
              </a>
              <a href="#" onClick={() => toast(`TODO`, { icon: '🔃' })}>
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
      <canvas id="b"></canvas>
      <UPExtension />
    </>
  )
}

const UPExtension = () => {
  return (
    <div className={styles.UPextension}>
      Don't have Universal Profile on your browser?
      <a href="https://chromewebstore.google.com/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn" target="_blank">
        <ChromeIcon />
      </a>
      <a href="https://chromewebstore.google.com/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn" target="_blank">
        <BraveIcon />
      </a>
    </div>
  )
}

export default App
