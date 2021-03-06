export interface IMultiSelectOption {
    id: any;
    name: string;
    isLabel?: boolean;
    parentId?: any;
    params?: any;
    classes?: string;
}
export interface IMultiSelectSettings {
    pullRight?: boolean;
    enableSearch?: boolean;
    /**
     * 0 - By default
     * If `enableSearch=true` and total amount of items more then `searchRenderLimit` (0 - No limit)
     * then render items only when user typed more then or equal `searchRenderAfter` charachters
     */
    searchRenderLimit?: number;
    /**
     * 3 - By default
     */
    searchRenderAfter?: number;
    /**
     * 0 - By default
     * If >0 will render only N first items
     */
    searchMaxLimit?: number;
    /**
     * 0 - By default
     * Used with searchMaxLimit to further limit rendering for optimization
     * Should be less than searchMaxLimit to take effect
     */
    searchMaxRenderedItems?: number;
    /**
     * 'id' - By default
     * What property should be used as id?
     */
    idProperty: string;
    /**
     * 'name' - By default
     * What property should be used as name?
     */
    nameProperty: string;
    checkedStyle?: 'checkboxes' | 'glyphicon' | 'fontawesome';
    buttonClasses?: string;
    itemClasses?: string;
    containerClasses?: string;
    selectionLimit?: number;
    minSelectionLimit?: number;
    closeOnSelect?: boolean;
    autoUnselect?: boolean;
    showCheckAll?: boolean;
    showUncheckAll?: boolean;
    fixedTitle?: boolean;
    dynamicTitleMaxItems?: number;
    maxHeight?: string;
    displayAllSelectedText?: boolean;
    isLazyLoad?: boolean;
    loadViewDistance?: number;
    stopScrollPropagation?: boolean;
}
export interface IMultiSelectTexts {
    checkAll?: string;
    uncheckAll?: string;
    checked?: string;
    checkedPlural?: string;
    searchPlaceholder?: string;
    saerchEmptyResult?: string;
    searchNoRenderText?: string;
    defaultTitle?: string;
    allSelected?: string;
}
