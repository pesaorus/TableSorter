/**
 * Constructor "TableSorter" to sort table rows by colomns.
 * By default table is sorted by domain name.
 * Table can be sorted by domain name, date and price.
 *
 * All needed data to sort table stored in td data- attributes.
 * Require jQuery.
 */
var TableSorter = (function($) {
    'use strict';

        // available sort types
    var availableSorts = ['name', 'date', 'price'];

    /**
     * Sorts incoming rows list.
     *
     * @param {Array} rowList - tbody rows array.
     * @param {String} sortBy - sort by name/date/price.
     * @returns {Array} - sorted rows list.
     */
    var sortRows = function(rowsList, sortBy) {
        var sortedRowsList,
            sortFunctions = {
                sortByName: function(a, b) {
                    var nameA = $(a).find('.dom-name').data('domain-name'),
                        nameB = $(b).find('.dom-name').data('domain-name');

                    return nameA > nameB ? 1 : -1;
                },

                sortByDate: function(a, b) {
                    var aSplited = $(a).find('.dom-buy').data('date').split('.'),
                        bSplited = $(b).find('.dom-buy').data('date').split('.'),
                        dateA = new Date( /*year*/aSplited[2], /*month*/aSplited[1], /*day*/aSplited[0] ),
                        dateB = new Date( /*year*/bSplited[2], /*month*/bSplited[1], /*day*/bSplited[0] ),
                        dateATime = dateA.getTime(),
                        dateBTime = dateB.getTime();
                    // if values are equal, we compare by name to sort different parts of table by names
                    return dateATime > dateBTime ? 1 : ( dateATime === dateBTime ? sortFunctions.sortByName(a, b) : -1 );
                },

                sortByPrice: function(a, b) {
                    var priceA = parseInt( $(a).find('.dom-price').data('price'), 10 ),
                        priceB = parseInt( $(b).find('.dom-price').data('price'), 10 );
                    // if values are equal, we compare by name to sort different parts of table by names
                    return priceA > priceB ? 1 : ( priceA === priceB ? sortFunctions.sortByName(a, b) : -1); 
                }
            };


        switch (sortBy) {
            case 'name':
                sortedRowsList = rowsList.sort( sortFunctions.sortByName );
                break;

            case 'date':
                sortedRowsList = rowsList.sort( sortFunctions.sortByDate );
                break;

            case 'price':
                sortedRowsList = rowsList.sort( sortFunctions.sortByPrice );
                break;

            default: // eq by name
                sortedRowsList = rowsList.sort( sortFunctions.sortByName );
        }

        return sortedRowsList;
    };

    /**
     * Adds classes to incoming rows list.
     * By default it`s 'even' and 'odd' classes.
     * This function can be replaced by css nth-child (odd|even), but now IE8 needs to be supported.
     *
     * @param {Array} rowList - tbody rows array
     * @param {Array} classNames - class names array to colorise rows, is optional, this capability is not realised yet =(
     * @returns {Array} - colorized rows list (rows list with rotational class names)
     */
    var recoloriseRows = function(rowsList, classNames) {
        var currentClass = 'even', // first row class
            recolorisedRows = [];

        recolorisedRows = $.each(rowsList, function() {
            if ( $(this).className !== currentClass ) {
                $(this).removeClass().addClass(currentClass);
            }
            currentClass = currentClass === 'even' ? 'odd' : 'even';
        });
        return recolorisedRows;
    };


    /**
     * TableSorter constructor.
     *
     * @param table - jq DOM element, table to be sorted.
     */
    var TableSorter = function(table) {
        // Main jquery DOM elements
        this.jqElems = {
            $table: $(table),
            $tableHead: $(table).find('thead'),
            $tableBody: $(table).find('tbody'),
            $headers: $(table).find('thead td b'),
            $rows: $(table).find('tbody tr')
        };
        // current rows array
        this.rowsArray = Array.prototype.slice.call(this.jqElems.$rows, 0);
        // sorted state, by defauld is 'name' (sorted by name)
        this.sortedState = 'name';
        // cash for sort results
        this.cachedSorts = {};
    };


    /**
     * Inserts rows list in table.
     *
     * @public
     * @param {Array} rowsList - sorted rows list
     */
    TableSorter.prototype.showSortedRows = function(rowsList) {
        this.jqElems.$tableBody.html( rowsList );
    };

    /**
     * TableSorter initialisation, sets
     * all event callbacks.
     *
     * @public
     */
    TableSorter.prototype.init = function() {
        var self = this;

        // first cache - initial rows order
        if (!this.cachedSorts['name']) {
            this.cachedSorts['name'] = this.rowsArray.slice();
        }

        this.jqElems.$headers.on('click', function(e) {
            var currentElement = $(this),
                sortType = currentElement.parent().data('sort-type');

            if ($.inArray(sortType, availableSorts) === -1) {
                sortType = availableSorts[0]; // 'name' by default
            }

            e.preventDefault();
            e.stopPropagation();

            if (sortType === self.sortedState) return; // disable sort repeating

            // adding 'sorted' class to table header
            self.jqElems.$headers.removeClass('sorted').removeClass('can_not_sort_more');
            currentElement.addClass('sorted').addClass('can_not_sort_more');

            // looking for cash
            if (!self.cachedSorts[sortType]) {
                self.cachedSorts[sortType] = sortRows( self.rowsArray, sortType ).slice();
            }

            self.showSortedRows( recoloriseRows( self.cachedSorts[sortType] ) );

            $.trigger('table:redraw');

            self.sortedState = sortType;
            
        });
    };

    return TableSorter;
})(jQuery);