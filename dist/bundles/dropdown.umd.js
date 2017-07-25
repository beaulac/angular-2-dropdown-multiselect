(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/forms'), require('rxjs/Subject'), require('rxjs/add/operator/takeUntil'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/forms', 'rxjs/Subject', 'rxjs/add/operator/takeUntil', '@angular/common'], factory) :
	(factory((global.dropdown = global.dropdown || {}),global.ng.core,global.ng.forms,global.Rx,global.Rx.Observable.prototype,global.ng.common));
}(this, (function (exports,_angular_core,_angular_forms,rxjs_Subject,rxjs_add_operator_takeUntil,_angular_common) { 'use strict';

var MultiSelectSearchFilter = (function () {
    function MultiSelectSearchFilter() {
        this._searchCache = {};
        this._searchCacheInclusive = {};
    }
    MultiSelectSearchFilter.prototype.transform = function (options, str, limit, renderLimit) {
        if (limit === void 0) { limit = 0; }
        if (renderLimit === void 0) { renderLimit = 0; }
        str = (str || '').toLowerCase();
        // Drop cache because options were updated
        if (options !== this._lastOptions) {
            this._lastOptions = options;
            this._searchCache = {};
            this._searchCacheInclusive = {};
        }
        if (this._searchCache[str]) {
            return this._limitRenderedItems(this._searchCache[str], renderLimit);
        }
        var prevStr = str.slice(0, -1);
        var prevResults = this._searchCache[prevStr];
        if (prevResults) {
            var prevInclusiveOrIdx = this._searchCacheInclusive[prevStr];
            if (prevInclusiveOrIdx === true) {
                // If have previous results and it was inclusive, do only subsearch
                options = prevResults;
            }
            else if (typeof prevInclusiveOrIdx === 'number') {
                // Or reuse prev results with unchecked ones
                options = prevResults.concat(options.slice(prevInclusiveOrIdx));
            }
        }
        var optsLength = options.length;
        var maxFound = limit > 0 ? Math.min(limit, optsLength) : optsLength;
        var filteredOpts = [];
        var regexp = new RegExp(this._escapeRegExp(str), 'i');
        var matchPredicate = function (option) { return regexp.test(option.name); }, getChildren = function (option) { return options.filter(function (child) { return child.parentId === option.id; }); }, getParent = function (option) { return options.find(function (parent) { return option.parentId === parent.id; }); };
        var i = 0, founded = 0;
        for (; i < optsLength && founded < maxFound; ++i) {
            var option = options[i];
            var directMatch = regexp.test(option.name);
            if (directMatch) {
                filteredOpts.push(option);
                founded++;
                continue;
            }
            if (typeof (option.parentId) === 'undefined') {
                var childrenMatch = getChildren(option).some(matchPredicate);
                if (childrenMatch) {
                    filteredOpts.push(option);
                    founded++;
                    continue;
                }
            }
            if (typeof (option.parentId) !== 'undefined') {
                var parentMatch = matchPredicate(getParent(option));
                if (parentMatch) {
                    filteredOpts.push(option);
                    founded++;
                    continue;
                }
            }
        }
        this._searchCache[str] = filteredOpts;
        this._searchCacheInclusive[str] = i === optsLength || i + 1;
        return this._limitRenderedItems(filteredOpts, renderLimit);
    };
    MultiSelectSearchFilter.prototype._limitRenderedItems = function (items, limit) {
        return items.length > limit ? items.slice(0, limit) : items;
    };
    MultiSelectSearchFilter.prototype._escapeRegExp = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    return MultiSelectSearchFilter;
}());
MultiSelectSearchFilter.decorators = [
    { type: _angular_core.Pipe, args: [{
                name: 'searchFilter'
            },] },
];
/** @nocollapse */
MultiSelectSearchFilter.ctorParameters = function () { return []; };

/*
 * Angular 2 Dropdown Multiselect for Bootstrap
 *
 * Simon Lindh
 * https://github.com/softsimon/angular-2-dropdown-multiselect
 */
var MULTISELECT_VALUE_ACCESSOR = {
    provide: _angular_forms.NG_VALUE_ACCESSOR,
    useExisting: _angular_core.forwardRef(function () { return MultiselectDropdown; }),
    multi: true
};
var MultiselectDropdown = (function () {
    function MultiselectDropdown(element, fb, differs) {
        this.element = element;
        this.fb = fb;
        this.disabled = false;
        this.selectionLimitReached = new _angular_core.EventEmitter();
        this.dropdownClosed = new _angular_core.EventEmitter();
        this.dropdownOpened = new _angular_core.EventEmitter();
        this.onAdded = new _angular_core.EventEmitter();
        this.onRemoved = new _angular_core.EventEmitter();
        this.onLazyLoad = new _angular_core.EventEmitter();
        this.destroyed$ = new rxjs_Subject.Subject();
        this.numSelected = 0;
        this.isVisible = false;
        this.renderItems = true;
        this.defaultSettings = {
            pullRight: false,
            enableSearch: false,
            searchRenderLimit: 0,
            searchRenderAfter: 1,
            searchMaxLimit: 0,
            searchMaxRenderedItems: 0,
            idProperty: 'id',
            nameProperty: 'name',
            checkedStyle: 'checkboxes',
            buttonClasses: 'btn btn-default btn-secondary',
            containerClasses: 'dropdown-inline',
            selectionLimit: 0,
            minSelectionLimit: 0,
            closeOnSelect: false,
            autoUnselect: false,
            showCheckAll: false,
            showUncheckAll: false,
            fixedTitle: false,
            dynamicTitleMaxItems: 3,
            maxHeight: '300px',
            isLazyLoad: false,
            stopScrollPropagation: false,
            loadViewDistance: 1
        };
        this.defaultTexts = {
            checkAll: 'Check all',
            uncheckAll: 'Uncheck all',
            checked: 'checked',
            checkedPlural: 'checked',
            searchPlaceholder: 'Search...',
            saerchEmptyResult: 'Nothing found...',
            searchNoRenderText: 'Type in search box to see results...',
            defaultTitle: 'Select',
            allSelected: 'All selected'
        };
        this.filterControl = this.fb.control('');
        this.onModelChange = function (_) {
        };
        this.onModelTouched = function () {
        };
        this.differ = differs.find([]).create(null);
        this.settings = this.defaultSettings;
        this.texts = this.defaultTexts;
    }
    MultiselectDropdown.prototype.onClick = function (target) {
        if (!this.isVisible) {
            return;
        }
        var parentFound = false;
        while (target != null && !parentFound) {
            if (target === this.element.nativeElement) {
                parentFound = true;
            }
            target = target.parentElement;
        }
        if (!parentFound) {
            this.isVisible = false;
            this.dropdownClosed.emit();
        }
    };
    MultiselectDropdown.prototype.idOf = function (object) {
        return _reach(object, this._idProp);
    };
    MultiselectDropdown.prototype.nameOf = function (object) {
        return _reach(object, this._nameProp);
    };
    Object.defineProperty(MultiselectDropdown.prototype, "searchLimit", {
        get: function () {
            return this.settings.searchRenderLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiselectDropdown.prototype, "searchRenderAfter", {
        get: function () {
            return this.settings.searchRenderAfter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiselectDropdown.prototype, "searchLimitApplied", {
        get: function () {
            return this.searchLimit > 0 && this.options.length > this.searchLimit;
        },
        enumerable: true,
        configurable: true
    });
    MultiselectDropdown.prototype.getItemStyle = function (option) {
        if (!option.isLabel) {
            return { 'cursor': 'pointer' };
        }
    };
    MultiselectDropdown.prototype.getItemStyleSelectionDisabled = function () {
        if (this.disabledSelection) {
            return { 'cursor': 'default' };
        }
    };
    MultiselectDropdown.prototype.ngOnInit = function () {
        this.settings = Object.assign(this.defaultSettings, this.settings);
        (_a = this.settings, this._idProp = _a.idProperty, this._nameProp = _a.nameProperty);
        this.texts = Object.assign(this.defaultTexts, this.texts);
        this.title = this.texts.defaultTitle || '';
        this.filterControl.valueChanges
            .takeUntil(this.destroyed$)
            .subscribe(function () {
            this.updateRenderItems();
            if (this.settings.isLazyLoad) {
                this.load();
            }
        }.bind(this));
        var _a;
    };
    MultiselectDropdown.prototype.ngOnChanges = function (changes) {
        if (changes['options']) {
            this.options = this.options || [];
            this.parents = this.options
                .filter(function (option) { return typeof option.parentId === 'number'; })
                .map(function (option) { return option.parentId; });
            this.updateRenderItems();
            if (this.texts) {
                this.updateTitle();
            }
        }
        if (changes['texts'] && !changes['texts'].isFirstChange()) {
            this.updateTitle();
        }
    };
    MultiselectDropdown.prototype.ngOnDestroy = function () {
        this.destroyed$.next();
    };
    MultiselectDropdown.prototype.updateRenderItems = function () {
        this.renderItems = !this.searchLimitApplied || this.filterControl.value.length >= this.searchRenderAfter;
    };
    MultiselectDropdown.prototype.writeValue = function (value) {
        if (value !== undefined && value !== null) {
            this.model = value;
        }
        else {
            this.model = [];
        }
    };
    MultiselectDropdown.prototype.registerOnChange = function (fn) {
        this.onModelChange = fn;
    };
    MultiselectDropdown.prototype.registerOnTouched = function (fn) {
        this.onModelTouched = fn;
    };
    MultiselectDropdown.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    MultiselectDropdown.prototype.ngDoCheck = function () {
        var changes = this.differ.diff(this.model);
        if (changes) {
            this.updateNumSelected();
            this.updateTitle();
        }
    };
    MultiselectDropdown.prototype.validate = function (_c) {
        return (this.model && this.model.length) ? null : {
            required: {
                valid: false
            }
        };
    };
    MultiselectDropdown.prototype.registerOnValidatorChange = function (_fn) {
        throw new Error('Method not implemented.');
    };
    MultiselectDropdown.prototype.clearSearch = function (event) {
        event.stopPropagation();
        this.filterControl.setValue('');
    };
    MultiselectDropdown.prototype.toggleDropdown = function () {
        this.isVisible = !this.isVisible;
        this.isVisible ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
    };
    MultiselectDropdown.prototype.isSelected = function (option) {
        return this.model && this.model.indexOf(this.idOf(option)) > -1;
    };
    MultiselectDropdown.prototype.setSelected = function (_event, option) {
        var _this = this;
        if (!this.disabledSelection) {
            _event.stopPropagation();
            if (!this.model) {
                this.model = [];
            }
            var optionId_1 = this.idOf(option);
            var optionParentId_1 = option.parentId;
            var index = this.model.indexOf(optionId_1);
            if (index > -1) {
                if ((this.settings.minSelectionLimit === undefined) || (this.numSelected > this.settings.minSelectionLimit)) {
                    this.model.splice(index, 1);
                    this.onRemoved.emit(optionId_1);
                }
                var parentIndex = optionParentId_1 && this.model.indexOf(optionParentId_1);
                if (parentIndex >= 0) {
                    this.model.splice(parentIndex, 1);
                    this.onRemoved.emit(optionParentId_1);
                }
                else if (this.parents.indexOf(optionId_1) > -1) {
                    var childIds_1 = this.options.filter(function (child) { return _this.model.indexOf(_this.idOf(child)) > -1 && child.parentId == optionId_1; })
                        .map(function (child) { return _this.idOf(child); });
                    this.model = this.model.filter(function (id) { return childIds_1.indexOf(id) < 0; });
                    childIds_1.forEach(function (childId) { return _this.onRemoved.emit(childId); });
                }
            }
            else {
                if (this.settings.selectionLimit === 0 || (this.settings.selectionLimit && this.model.length < this.settings.selectionLimit)) {
                    this.model.push(optionId_1);
                    this.onAdded.emit(optionId_1);
                    if (optionParentId_1) {
                        var children = this.options.filter(function (child) { return _this.idOf(child) !== optionId_1 && child.parentId == optionParentId_1; });
                        if (children.every(function (child) { return _this.model.indexOf(_this.idOf(child)) > -1; })) {
                            this.model.push(optionParentId_1);
                            this.onAdded.emit(optionParentId_1);
                        }
                    }
                    else if (this.parents.indexOf(optionId_1) > -1) {
                        var children = this.options.filter(function (child) { return _this.model.indexOf(_this.idOf(child)) < 0 && child.parentId == optionId_1; });
                        children.forEach(function (child) {
                            _this.model.push(_this.idOf(child));
                            _this.onAdded.emit(_this.idOf(child));
                        });
                    }
                }
                else {
                    if (this.settings.autoUnselect) {
                        this.model.push(optionId_1);
                        this.onAdded.emit(optionId_1);
                        var removedOption = this.model.shift();
                        this.onRemoved.emit(removedOption);
                    }
                    else {
                        this.selectionLimitReached.emit(this.model.length);
                        return;
                    }
                }
            }
            if (this.settings.closeOnSelect) {
                this.toggleDropdown();
            }
            this.model = this.model.slice();
            this.onModelChange(this.model);
            this.onModelTouched();
        }
    };
    MultiselectDropdown.prototype.updateNumSelected = function () {
        var _this = this;
        this.numSelected = this.model && this.model.filter(function (id) { return _this.parents.indexOf(id) < 0; }).length || 0;
    };
    MultiselectDropdown.prototype.updateTitle = function () {
        var _this = this;
        if (this.numSelected === 0 || this.settings.fixedTitle) {
            this.title = (this.texts) ? this.texts.defaultTitle : '';
        }
        else if (this.settings.displayAllSelectedText && this.model.length === this.options.length) {
            this.title = (this.texts) ? this.texts.allSelected : '';
        }
        else if (this.settings.dynamicTitleMaxItems && this.settings.dynamicTitleMaxItems >= this.numSelected) {
            this.title = this.options
                .filter(function (option) {
                return _this.model && _this.model.indexOf(_this.idOf(option)) > -1;
            })
                .map(function (option) { return _this.nameOf(option); })
                .join(', ');
        }
        else {
            this.title = this.numSelected
                + ' '
                + (this.numSelected === 1 ? this.texts.checked : this.texts.checkedPlural);
        }
    };
    MultiselectDropdown.prototype.searchFilterApplied = function () {
        return this.settings.enableSearch && this.filterControl.value && this.filterControl.value.length > 0;
    };
    MultiselectDropdown.prototype.checkAll = function () {
        var _this = this;
        if (!this.disabledSelection) {
            var checkedOptions = (!this.searchFilterApplied() ? this.options :
                (new MultiSelectSearchFilter()).transform(this.options, this.filterControl.value))
                .filter(function (option) {
                var optionId = _this.idOf(option);
                if (_this.model.indexOf(optionId) === -1) {
                    _this.onAdded.emit(optionId);
                    return true;
                }
                return false;
            }).map(function (option) { return _this.idOf(option); });
            this.model = this.model.concat(checkedOptions);
            this.onModelChange(this.model);
            this.onModelTouched();
        }
    };
    MultiselectDropdown.prototype.uncheckAll = function () {
        var _this = this;
        if (!this.disabledSelection) {
            var unCheckedOptions_1 = (!this.searchFilterApplied() ? this.model
                : (new MultiSelectSearchFilter()).transform(this.options, this.filterControl.value)
                    .map(function (option) { return _this.idOf(option); }));
            this.model = this.model.filter(function (id) {
                if (((unCheckedOptions_1.indexOf(id) < 0) && (_this.settings.minSelectionLimit === undefined)) || ((unCheckedOptions_1.indexOf(id) < _this.settings.minSelectionLimit))) {
                    return true;
                }
                else {
                    _this.onRemoved.emit(id);
                    return false;
                }
            });
            this.onModelChange(this.model);
            this.onModelTouched();
        }
    };
    MultiselectDropdown.prototype.preventCheckboxCheck = function (event, option) {
        if (this.settings.selectionLimit && !this.settings.autoUnselect &&
            this.model.length >= this.settings.selectionLimit &&
            this.model.indexOf(this.idOf(option)) === -1) {
            event.preventDefault();
        }
    };
    MultiselectDropdown.prototype.isCheckboxDisabled = function () {
        return this.disabledSelection;
    };
    MultiselectDropdown.prototype.checkScrollPosition = function (ev) {
        var scrollTop = ev.target.scrollTop;
        var scrollHeight = ev.target.scrollHeight;
        var scrollElementHeight = ev.target.clientHeight;
        var roundingPixel = 1;
        var gutterPixel = 1;
        if (scrollTop >= scrollHeight - (1 + this.settings.loadViewDistance) * scrollElementHeight - roundingPixel - gutterPixel) {
            this.load();
        }
    };
    MultiselectDropdown.prototype.checkScrollPropagation = function (ev, element) {
        var scrollTop = element.scrollTop;
        var scrollHeight = element.scrollHeight;
        var scrollElementHeight = element.clientHeight;
        if ((ev.deltaY > 0 && scrollTop + scrollElementHeight >= scrollHeight) || (ev.deltaY < 0 && scrollTop <= 0)) {
            ev = ev || window.event;
            ev.preventDefault && ev.preventDefault();
            ev.returnValue = false;
        }
    };
    MultiselectDropdown.prototype.load = function () {
        this.onLazyLoad.emit({
            length: this.options.length,
            filter: this.filterControl.value
        });
    };
    return MultiselectDropdown;
}());
MultiselectDropdown.decorators = [
    { type: _angular_core.Component, args: [{
                selector: 'ss-multiselect-dropdown',
                template: '<div class="dropdown" [ngClass]="settings.containerClasses" [class.open]="isVisible"><button type="button" class="dropdown-toggle" [ngClass]="settings.buttonClasses" (click)="toggleDropdown()" [disabled]="disabled">{{ title }}<span class="caret"></span></button><ul #scroller *ngIf="isVisible" class="dropdown-menu" (scroll)="settings.isLazyLoad ? checkScrollPosition($event) : null" (wheel)="settings.stopScrollPropagation ? checkScrollPropagation($event, scroller) : null" [class.pull-right]="settings.pullRight" [class.dropdown-menu-right]="settings.pullRight" [style.max-height]="settings.maxHeight" style="display: block; height: auto; overflow-y: auto"><li class="dropdown-item search" *ngIf="settings.enableSearch"><div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon3"><i class="fa fa-search"></i></span> <input type="text" class="form-control" placeholder="{{ texts.searchPlaceholder }}" aria-describedby="sizing-addon3" [formControl]="filterControl" autofocus> <span class="input-group-btn" *ngIf="filterControl.value.length > 0"><button class="btn btn-default btn-secondary" type="button" (click)="clearSearch($event)"><i class="fa fa-times"></i></button></span></div></li><li class="dropdown-divider divider" *ngIf="settings.enableSearch"></li><li class="dropdown-item check-control check-control-check" *ngIf="settings.showCheckAll && !disabledSelection"><a href="javascript:;" role="menuitem" tabindex="-1" (click)="checkAll()"><span style="width: 16px" [ngClass]="{\'glyphicon glyphicon-ok\': settings.checkedStyle !== \'fontawesome\',\'fa fa-check\': settings.checkedStyle === \'fontawesome\'}"></span> {{ texts.checkAll }}</a></li><li class="dropdown-item check-control check-control-uncheck" *ngIf="settings.showUncheckAll && !disabledSelection"><a href="javascript:;" role="menuitem" tabindex="-1" (click)="uncheckAll()"><span style="width: 16px" [ngClass]="{\'glyphicon glyphicon-remove\': settings.checkedStyle !== \'fontawesome\',\'fa fa-times\': settings.checkedStyle === \'fontawesome\'}"></span> {{ texts.uncheckAll }}</a></li><li *ngIf="settings.showCheckAll || settings.showUncheckAll" class="dropdown-divider divider"></li><ng-template [ngIf]="renderItems" [ngIfElse]="noRenderBlock"><ng-template [ngIf]="options | searchFilter:(!settings.isLazyLoad ? filterControl.value : \'\'):settings.searchMaxLimit:settings.searchMaxRenderedItems" let-filteredOptions><li *ngIf="!filteredOptions.length" class="dropdown-item empty">{{ texts.saerchEmptyResult }}</li><li class="dropdown-item" [ngStyle]="getItemStyle(option)" *ngFor="let option of filteredOptions" (click)="!option.isLabel && setSelected($event, option)" [class.dropdown-header]="option.isLabel" [ngClass]="option.classes"><ng-template [ngIf]="option.isLabel">{{ option.name }}</ng-template><a *ngIf="!option.isLabel" href="javascript:;" role="menuitem" tabindex="-1" [style.padding-left]="this.parents.length>0&&this.parents.indexOf(option.id)<0&&\'30px\'" [ngStyle]="getItemStyleSelectionDisabled()"><input *ngIf="settings.checkedStyle === \'checkboxes\'" type="checkbox" [checked]="isSelected(option)" (click)="preventCheckboxCheck($event, option)" [disabled]="isCheckboxDisabled()" [ngStyle]="getItemStyleSelectionDisabled()"> <span *ngIf="settings.checkedStyle === \'glyphicon\'" style="width: 16px" class="glyphicon" [class.glyphicon-ok]="isSelected(option)"></span> <span *ngIf="settings.checkedStyle === \'fontawesome\'" style="width: 16px;display: inline-block"><i *ngIf="isSelected(option)" class="fa fa-check" aria-hidden="true"></i> </span><span [ngClass]="settings.itemClasses" [style.font-weight]="this.parents.indexOf(option.id)>=0?\'bold\':\'normal\'">{{ option.name }}</span></a></li></ng-template></ng-template><ng-template #noRenderBlock><li class="dropdown-item empty">{{ texts.searchNoRenderText }}</li></ng-template></ul></div>',
                styles: ['a {  outline: none !important;}.dropdown-inline {  display: inline-block;}.dropdown-toggle .caret {  margin-left: 4px;  white-space: nowrap;  display: inline-block;}'],
                providers: [MULTISELECT_VALUE_ACCESSOR]
            },] },
];
/** @nocollapse */
MultiselectDropdown.ctorParameters = function () { return [
    { type: _angular_core.ElementRef, },
    { type: _angular_forms.FormBuilder, },
    { type: _angular_core.IterableDiffers, },
]; };
MultiselectDropdown.propDecorators = {
    'options': [{ type: _angular_core.Input },],
    'settings': [{ type: _angular_core.Input },],
    'texts': [{ type: _angular_core.Input },],
    'disabled': [{ type: _angular_core.Input },],
    'disabledSelection': [{ type: _angular_core.Input },],
    'selectionLimitReached': [{ type: _angular_core.Output },],
    'dropdownClosed': [{ type: _angular_core.Output },],
    'dropdownOpened': [{ type: _angular_core.Output },],
    'onAdded': [{ type: _angular_core.Output },],
    'onRemoved': [{ type: _angular_core.Output },],
    'onLazyLoad': [{ type: _angular_core.Output },],
    'onClick': [{ type: _angular_core.HostListener, args: ['document: click', ['$event.target'],] },],
};
function _reach(obj, chain) {
    var path = chain.split('.');
    var ref = obj;
    for (var i = 0; i < path.length; ++i) {
        var key = path[i];
        // ref must be an object or function and contain key
        if (ref === null
            || (typeof ref !== 'object' && typeof ref !== 'function')
            || !(key in ref)) {
            return undefined;
        }
        ref = ref[key];
    }
    return ref;
}

var MultiselectDropdownModule = (function () {
    function MultiselectDropdownModule() {
    }
    return MultiselectDropdownModule;
}());
MultiselectDropdownModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                imports: [_angular_common.CommonModule, _angular_forms.ReactiveFormsModule],
                exports: [MultiselectDropdown, MultiSelectSearchFilter],
                declarations: [MultiselectDropdown, MultiSelectSearchFilter],
            },] },
];
/** @nocollapse */
MultiselectDropdownModule.ctorParameters = function () { return []; };

exports.MultiSelectSearchFilter = MultiSelectSearchFilter;
exports.MultiselectDropdownModule = MultiselectDropdownModule;
exports.MultiselectDropdown = MultiselectDropdown;

Object.defineProperty(exports, '__esModule', { value: true });

})));
