<?php

namespace App;

trait SearchFilter
{
    public function dateFilter($mode = 'get_option', $filter = '' ) {
        //เอาไปใช้กับ form
        $options = [
                'today' => 'วันนี้',
                'current_week' => 'สัปดาห์นี้',
                'current_mouth' => 'เดือนนี้',
                'current_year' => 'ปีนี้'
            ];
        if($mode == 'get_option'){
            return $options;
        }

        if($mode == 'search'){
            //ของ today
            $result = ['start_at'=> now(), 'end_at' => now()];
            switch ($filter) {
                case 'current_week':
                    $result['start_at'] = now()->startOfWeek();
                    $result['end_at'] = now()->endOfWeek();
                    break;
                case 'current_mouth':
                    $result['start_at'] = now()->startOfMonth();
                    $result['end_at'] = now()->endOfMonth();
                    break;
                case 'current_year':
                    $result['start_at'] = now()->startOfYear();
                    $result['end_at'] = now()->endOfYear();
                    break;
            }

            return $result;

        }
    }

    public function StatusOption($mode = 'get_option', $table='cart'){

    }
}
