
/**
 * Split and reorder seasons
 * Splits first interval that is overlapped with others below, the second overlappedinterval stays the same
 */
function splitAndOrderSeasons()
{
    var i,j;
    var overlap         = false;
    var $seasonTable    = $('#seasonsTable').find('tbody');
    var $seasons        = $seasonTable.find('tr');
    var seasonsDates    = getAllSeasonInterval($seasons);

    for (i = 0; i < seasonsDates.length; i++) {
        for (j = i + 1; j < seasonsDates.length; j++) {
            if (seasonsDates[i].length < 2) {
                throw new TypeError('Missing from/to date');
            }
            //if seasons overlaps split them
            overlap = dateRangeOverlaps(seasonsDates[i][0], seasonsDates[i][1],seasonsDates[j][0], seasonsDates[j][1]);

            if(overlap) { // Split Dates
                var newDateRanges = splitDateRange(seasonsDates[i][0], seasonsDates[i][1], seasonsDates[j][0], seasonsDates[j][1]);

                // Add the splitted dates at the end
                $(newDateRanges).each(function(k,e){

                    var seasonId = $seasons.eq(i).find('.seasonSelect').val();
                    // check if the interval is the 2-nd overlapped
                    var checkOverlap = dateRangeOverlaps(e['from'],e['to'], seasonsDates[j][0], seasonsDates[j][1]);

                    // Add new season for each new ranges
                    if(!checkOverlap)
                    {
                        addSeasonEntry(seasonId, true);
                        var newRow = $seasonTable.find('tr:first');

                        newRow.find('.datepickerFrom').val($.datepicker.formatDate("MM dd, yy", e['from']));
                        newRow.find('.datepickerTo').val($.datepicker.formatDate("MM dd, yy", e['to']));
                    }

                });

                // remove the overlapped dates
                $seasons[i].remove();

                initDatePickers('.datepickerFrom','.datepickerTo');
                break;
            }
        }
        if(overlap) // check for overlap for the new splitted date
        {
            splitAndOrderSeasons();
            break;
        }
    }

    $seasonTable.find('.has-error').removeClass('has-error');
    $('.errorMessages').addClass('hidden');
	orderSeasons($seasonTable);
	// You can merge consecutive Seasons
    //mergeConsecutiveSeasons($('#seasonsTable').find('tbody tr'));
}


/**
 * Add new Season
 *
 */
function addSeasonEntry(seasonId, prepend)
{
    var datepickerFrom = '.datepickerFrom';
    var datepickerTo   = '.datepickerTo';

    //Get LAST table tr data number (var rowNr)
    var row = $('#seasonsTable tr:last').clone(); // last row
    if(prepend)
    {
        var rowData = 0;
        $('#seasonsTable tbody tr').each(function()
        {
            if(parseInt($(this).data('rownr')) > rowData)
            {
                rowData = $(this).data('rownr');
                row = $(this).clone();
            }
        });
    }
    var rowNr = row.data('rownr');
    rowNr = parseInt(rowNr) + 1;

    //Clone row and replace each name attribute with incremented rowNr
    row.attr("data-rownr",rowNr);
    row.find('input, select').each(function()
    {
        var thisName = $(this).attr('name');
        thisName     = thisName.replace(/\d+/,rowNr);

        $(this).attr('name', thisName);
    });

    row.find('.addSeason').addClass('hidden');
    row.find('.removeSeason').removeClass('hidden');

    // set season
    row.find('.seasonSelect').val(seasonId);

    if(prepend)
    {
        $('#seasonsTable').prepend(row);
    } else
    {
        $('#seasonsTable').append(row);
    }

    //Init datepicker events
    row.find('.hasDatepicker').removeAttr('id').removeClass('hasDatepicker');
    initDatePickers(datepickerFrom,datepickerTo);
}


/**
 * Event on removing season
 * */
function removeSeasonEntry()
{
    $(document).on('click','.removeSeason', function(){
        var row = $(this).parents('tr');
        Confirm('Are you sure you want to delete this entry?',
            function () {
                row.remove();         
                return true;
            }
        );
    });   
}



/**
 * Check if 2 date range overlaps
 * Used in multipleDateRangeOverlaps
 */
function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
    if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
    if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
    if (b_start <  a_start && a_end   <  b_end) return true; // a in b
    return false;
}

/**
 *
 * @param a_start
 * @param a_end
 * @param b_start
 * @param b_end
 * @returns {Array}
 */
function splitDateRange(a_start, a_end, b_start, b_end)
{
    var dateRangeArr = [];
    var interval     = {};
    var specialCase_start, specialCase_end = false;

    //Special case
    if(a_start.getTime() == b_start.getTime())
    {
        specialCase_start = true;
    }

    //Special case
    if(a_end.getTime() == b_end.getTime())
    {
        specialCase_end = true
    }

    //Special case
    if(a_end.getTime() == b_start.getTime() && a_start.getTime() < b_start.getTime())
    {
        interval['from']    = new Date(a_start);
        //interval['to']      = new Date(a_end);
        var dummyFromDate   = new Date(a_end);
        interval['to']    = new Date(dummyFromDate.setDate(dummyFromDate.getDate()-1));
        dateRangeArr.push(interval);

        interval            = {};
        //var dummyFromDate   = new Date(b_start);
        //interval['from']    = new Date(dummyFromDate.setDate(dummyFromDate.getDate()+1));
        interval['from']      = new Date(b_start);
        interval['to']      = new Date(b_end);
        dateRangeArr.push(interval);

        return dateRangeArr;
    }

    // first interval from low start to high start-1
    if(!specialCase_start)
    {
        interval['from']    = new Date(a_start);
        interval['to']      = new Date(b_start);
        if (a_start > b_start)
        {
            interval['from'] = new Date(b_start);
            interval['to']   = new Date(a_start);
        }
        interval['to'] = new Date(interval['to'].setDate(interval['to'].getDate() - 1));
        dateRangeArr.push(interval);
    }

    // second interval from high start to low end
    interval         = {};
    interval['from'] = new Date(b_start);
    interval['to']   = new Date(a_end);
    if(a_start > b_start) {
        interval['from'] = new Date(a_start);
    }
    if(a_end > b_end) {
        interval['to']   = new Date(b_end);
    }
    if(!specialCase_start)
    {
        interval['from'] = new Date(interval['from'].setDate(interval['from'].getDate()));
    }
    dateRangeArr.push(interval);


    // 3th interval from low end+1 to high end
    if(!specialCase_end)
    {
        interval            = {};
        interval['from']    = new Date(a_end);
        interval['to']      = new Date(b_end);
        if (a_end > b_end)
        {
            interval['from'] = new Date(b_end);
            interval['to']   = new Date(a_end);
        }

        var dummyDate    = new Date(interval['from'].getTime());
        interval['from'] = new Date(dummyDate.setDate(interval['from'].getDate()+1));
        dateRangeArr.push(interval);
    }

    return dateRangeArr;
}




/**
 * Order Seasons
 */
function orderSeasons($tableBody)
{
    var elems = $.makeArray($tableBody.find("tr").detach());
    elems.sort(function(a, b) {
        var $a = $(a).find('.datepickerFrom').datepicker('getDate');
        var $b = $(b).find('.datepickerFrom').datepicker('getDate');

        if($a.getTime() > $b.getTime())
        {
            return 1;
        } else {
            return -1;
        }
    });

    $tableBody.append(elems);

    $tableBody.find('.glyphicon-plus-sign:visible').addClass('hidden').next().removeClass('hidden');
    $tableBody.find('.glyphicon-plus-sign:first').removeClass('hidden').next().addClass('hidden');
}

/**
 * Merge Consecutive seasons
 * Season table should be order by date asc
 * @param $seasons
 */
function mergeConsecutiveSeasons($seasons)
{
    $seasons.each(function(k,v) {
        if($(v).find('.seasonSelect').val() == $seasons.eq(k + 1).find('.seasonSelect').val())
        {
            if(k < $seasons.length-1 && typeof $seasons.eq(k + 1) != "undefined")
            {
                var toDate   = $(v).find('.datepickerTo').datepicker('getDate');
                var fromDate = $seasons.eq(k + 1).find('.datepickerFrom').datepicker('getDate');
                fromDate     = new Date(fromDate.setDate(fromDate.getDate()-1));

                if(toDate.getTime() == fromDate.getTime())
                {
                     $(v).find('.datepickerTo').datepicker('setDate', $seasons.eq(k + 1).find('.datepickerTo').datepicker('getDate'));
                     $seasons.eq(k + 1).remove();
                     $seasons.splice(k);
                     mergeConsecutiveSeasons($seasons);
                }

            }
        }
    });
}

/**
 * Get season interval in readable format
 * @param $seasonsHolder
 * @returns {Array}
 */
function getAllSeasonInterval($seasonsHolder)
{
    var seasonsDates = [];
    $seasonsHolder.each(function(k,v) {
        seasonsDates[k] = [];
        seasonsDates[k].push($(v).find('.datepickerFrom').datepicker('getDate'));
        seasonsDates[k].push($(v).find('.datepickerTo').datepicker('getDate'));
    });

    return seasonsDates;
}


/**
 * @param datepickerFrom
 * @param datepickerTo
 */
function initDatePickers(datepickerFrom, datepickerTo)
{
     $(datepickerFrom).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'MM dd, yy',
        firstDay: 1,        
        onClose: function(selectedDate) {
            // Get datepickerTo on this row
            var rowTo = $(this).parents('tr').find(datepickerTo);
            rowTo.datepicker("option", "minDate", selectedDate);
        }
    });


    $(datepickerTo).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'MM dd, yy',
        firstDay: 1,
		setDate: new Date(),
        onClose: function(selectedDate) {
            // Get datepickerFrom  on this row
            var rowFrom = $(this).parents('tr').find(datepickerFrom);
            rowFrom.datepicker( "option", "maxDate", selectedDate );
        }
    });
	

    // Icon Trigger
    $(document).on('click','.glyphicon-calendar',function() {
        $(this).closest('.input-group').find('.hasDatepicker').datepicker().focus();
    });
}