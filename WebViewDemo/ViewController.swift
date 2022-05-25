//
//  ViewController.swift
//  WebViewDemo
//
//  Created by xulihang on 2022/5/24.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    var webView: WKWebView!
    var button: UIButton!
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        if #available(iOS 9.0, *){
            configuration.requiresUserActionForMediaPlayback = false
        }else{
            configuration.mediaPlaybackRequiresUserAction = false
        }
        let contentController = WKUserContentController()
        configuration.userContentController = contentController
        
        //create the webView with the custom configuration.
        self.webView = WKWebView(frame: .zero, configuration: configuration)
        //Set the WebView's delegate.
        self.webView.navigationDelegate = self //Delegate that handles page navigation
        self.webView.uiDelegate = self //Delegate that handles new tabs, windows, popups, layout, etc..
        
        self.button = UIButton(frame: .zero)
        self.button.setTitle("Scan Barcodes", for: .normal)
        self.button.setTitleColor(.systemBlue, for: .normal)
        self.button.setTitleColor(.lightGray, for: .highlighted)

        self.button.addTarget(self,
                         action: #selector(buttonAction),
                         for: .touchUpInside)
        
        
        self.view.addSubview(self.webView)
        self.view.addSubview(self.button)
        self.webView.isHidden = true
    }
    
    @objc
    func buttonAction() {
        self.webView.isHidden = false
        let url = URL(string:"https://blog.xulihang.me/barcode-detection-api-demo/scanner.html")
        let request = URLRequest(url: url!)
        self.webView.load(request)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        if let webView = self.webView {
            let insets = view.safeAreaInsets
            let width: CGFloat = view.frame.width
            let x = view.frame.width - insets.right - width
            let y = insets.top
            let height = view.frame.height - insets.top - insets.bottom
            webView.frame = CGRect.init(x: x, y: y, width: width, height: height)
        }
        if let button = self.button {
            let width: CGFloat = 300
            let height: CGFloat = 50
            let x = view.frame.width/2 - width/2
            let y = view.frame.height - 100
            button.frame = CGRect.init(x: x, y: y, width: width, height: height)
        }
    }
}

