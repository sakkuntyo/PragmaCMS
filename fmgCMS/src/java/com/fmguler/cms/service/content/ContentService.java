/*
 *  fmgCMS
 *  Copyright 2011 PragmaCraft LLC.
 * 
 *  All rights reserved.
 */
package com.fmguler.cms.service.content;

import com.fmguler.cms.service.content.domain.Page;
import java.util.List;

/**
 * Handles content operations
 * Uses fmgVen for db operations (No DAO used for rapid prototyping)
 * @author Fatih Mehmet Güler
 */
public interface ContentService {
    /**
     * Return the page with the specified path
     * @param path the path of the page
     * @return page object with attributes
     */
    public Page getPage(String path);

    /**
     * @return all pages in the system
     */
    List getPages();
}
