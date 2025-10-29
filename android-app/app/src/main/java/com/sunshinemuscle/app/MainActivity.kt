package com.sunshinemuscle.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView

    // URLs configuráveis via resources
    private lateinit var SERVER_URL: String
    private lateinit var FALLBACK_URL: String
    private lateinit var APP_URL: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inicializa URLs a partir dos resources
        SERVER_URL = getString(R.string.server_url)
        FALLBACK_URL = getString(R.string.fallback_url)
        APP_URL = SERVER_URL

        val progressBar = findViewById<View>(R.id.progressBar)
        webView = findViewById(R.id.webView)

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
            allowFileAccess = true
            allowContentAccess = true
            setAllowFileAccessFromFileURLs(true)
            setAllowUniversalAccessFromFileURLs(true)
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.visibility = if (newProgress in 1..99) View.VISIBLE else View.GONE
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                // Se falhar ao carregar do servidor, tenta assets offline
                if (failingUrl == SERVER_URL) {
                    APP_URL = FALLBACK_URL
                    view?.loadUrl(FALLBACK_URL)
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                val target = url ?: return false
                val isAsset = target.startsWith("file:///android_asset") || target.startsWith("file:///")
                val isInternalHttp = target.startsWith("http://10.0.2.2") || target.startsWith("/")
                val isHttpsSameOrigin = APP_URL.startsWith("https://") && target.startsWith(APP_URL)
                val isSpecial = target.startsWith("mailto:") || target.startsWith("tel:")

                return when {
                    isAsset || isInternalHttp || isHttpsSameOrigin -> false // abre no próprio WebView
                    isSpecial -> {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(target)))
                        true
                    }
                    else -> {
                        // Links externos vão para o navegador
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(target)))
                        true
                    }
                }
            }
        }

        webView.loadUrl(APP_URL)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}