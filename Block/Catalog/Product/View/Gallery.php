<?php
/**
 * Copyright © 2013-2017 Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * Simple product data view
 *
 * @author     Magento Core Team <core@magentocommerce.com>
 */
namespace Freese\Gallery\Block\Catalog\Product\View;

class Gallery extends \Magento\Catalog\Block\Product\View\Gallery
{

    protected $scopeConfig;

    /**
     * @param \Magento\Catalog\Block\Product\Context $context
     * @param \Magento\Framework\Stdlib\ArrayUtils $arrayUtils
     * @param EncoderInterface $jsonEncoder
     * @param array $data
     */

public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\Stdlib\ArrayUtils $arrayUtils,
        \Magento\Framework\Json\EncoderInterface $jsonEncoder,
        array $data = []
    ) {
        $this->jsonEncoder = $jsonEncoder;
        parent::__construct($context, $arrayUtils, $jsonEncoder, $data);
    }
      
    
    /*
    * get PHP object of Gallery images
    */
    public function getGalleryImagesPhp()
    {
        $imagesItems = [];
        foreach ($this->getGalleryImages() as $image) {
            $imagesItems[] = [
                'thumb' => $image->getData('small_image_url'),
                'img' => $image->getData('medium_image_url'),
                'full' => $image->getData('large_image_url'),
                'caption' => $image->getLabel(),
                'position' => $image->getPosition(),
                'isMain' => $this->isMainImage($image),
            ];
        }
        if (empty($imagesItems)) {
            $imagesItems[] = [
                'thumb' => $this->_imageHelper->getDefaultPlaceholderUrl('thumbnail'),
                'img' => $this->_imageHelper->getDefaultPlaceholderUrl('image'),
                'full' => $this->_imageHelper->getDefaultPlaceholderUrl('image'),
                'caption' => '',
                'position' => '0',
                'isMain' => true,
            ];
        }
        return $imagesItems;
    }


    public function getMainImage(){
        $url = "";
        $json=$this->getGalleryImagesJson();
        $galImgs = json_decode($json,true);
        foreach ($galImgs as $img) {
            if($img['isMain'] === true){
                $url = $img['img'];   
            }   
        }
        return $url;
    }

    public function getNfImagesList(){
        $imgList = array();
        $json = $this->getGalleryImagesJson();
        $galImgs = json_decode($json,true);
        foreach ($galImgs as $img) { 
            $x = json_decode('{}');
            $x->img = $img['img'];
            array_push($imgList, $x);
        }
        return $imgList;
    }

    

    public function getImageArray($galleryDataObj)
    {
      $arr = array();
      foreach($galleryDataObj as $obj){
        array_push($arr, $obj['thumb']);
        array_push($arr, $obj['img']);
      }
      echo "<script> window.galleryImgData = " .  json_encode($arr) . ";</script>";
    }

    public function getScopeConfig($path)
    {
        return $this->_scopeConfig->getValue($path);
    }

    public function hasSettings()
    {
        $settingsJSON = $this->getScopeConfig('nfgallery/general/settings');
        if($settingsJSON !== ""){
            return true;
        }

        return false;
    }
}
