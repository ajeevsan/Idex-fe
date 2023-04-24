
# importing libraries
import tensorflow as tf
import cx_Oracle
#cx_Oracle.init_oracle_client(lib_dir='/usr/lib/oracle/11.2/client64/bin')
import time
from threading import Timer
from datetime import datetime
import gevent
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
import json
from flask import Flask, request
# from flask import Flask, 
from flask_cors import CORS
import numpy as np
import pandas as pd
from pickle import load
import signal
import sys
import configparser
import logging
from preproccess import Clean_data

import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
#Remember to uncomment in CNWP
#Alert Manish
#os.environ["ORACLE_HOME"] = '/usr/lib/oracle/11.2/client64'

def exit_func(signal, frame):
    sys.exit(0)


signal.signal(signal.SIGINT, exit_func)

config = configparser.ConfigParser()
config.optionxform = str
config.read("config.ini")

app = Flask(__name__)
sockets = Sockets(app)  # Sockets are used for connecting two nodes on network.
# CORS is used for sending data from one website to another,which sometimes get prohibited.
cors = CORS(app, resources={r"/*": {"origins": "*"}})
#   origin
stn_selected = None
date_selected = None
fchr_selected = None
socketFlag = False


db_hostname = config.get('CONNECTION', 'hostname')
db_port = config.getint('CONNECTION', 'port')
# 14-03-2022 Manish , changed according to my system connection
db_sid = config.get('CONNECTION', 'sid')
db_user = config.get('CONNECTION', 'user')
db_password = config.get('CONNECTION', 'password')
db_encoding = config.get('CONNECTION', 'encoding')
dsn = cx_Oracle.makedsn(db_hostname, db_port, db_sid)


def whichData(x):
    if x.isdigit():
        return 'int'
    elif x.replace('.', '', 1).isdigit() and x.count('.') < 2:
        return 'float'
    else:
        return 'string'


# class definition of repeated timer
class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer = None
        self.interval = interval
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.is_running = False
        self._run()

    def _run(self):
        self.is_running = False
        self.function(*self.args, **self.kwargs)
        self.start()

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = True


# prediction of visibility for a particular city based on selected city, forecast hours and timing
def predict(station, name1, _pcontinueFrmDate, values, _df_COMP_IDEX4):
    try:
        print("\n----------------- ",values['fchr'], " forecasting for ", station, "-------------")
        print("_pcontinueFrmDate :", _pcontinueFrmDate)
        global x_scaler_GKP6
        global y_scaler_GKP6
        global x_scaler_SNG6
        global y_scaler_SNG6
        global x_scaler_CDH6
        global y_scaler_CDH6
        global x_scaler_HND6
        global y_scaler_HND6
        global x_scaler_GKP48
        global y_scaler_GKP48
        global x_scaler_SNG48
        global y_scaler_SNG48
        global x_scaler_CDH48
        global y_scaler_CDH48
        global x_scaler_HND48
        global y_scaler_HND48
        global actuals_with_time
        global date_time

        if values['fchr'] == '6hr':
            if station == 'SNG':
                #print("Manish")
                stn_id = '00001'
                x_scaler = x_scaler_SNG6
                y_scaler = y_scaler_SNG6
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'SNG_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'SNG_input_features_len')

            elif station == 'GKP':
                stn_id = '00056'
                x_scaler = x_scaler_GKP6
                y_scaler = y_scaler_GKP6
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'GKP_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'GKP_input_features_len')

            elif station == 'HND':
                stn_id = '00017'
                x_scaler = x_scaler_HND6
                y_scaler = y_scaler_HND6
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'HND_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'HND_input_features_len')

            elif station == 'CDH':
                stn_id = '00010'
                x_scaler = x_scaler_CDH6
                y_scaler = y_scaler_CDH6
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'CDH_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'CDH_input_features_len')

        if values['fchr'] == '48hr':
            if station == 'SNG':
                stn_id = '00001'
                x_scaler = x_scaler_SNG48
                y_scaler = y_scaler_SNG48
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'SNG_48_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'SNG_48_input_features_len')

            elif station == 'GKP':
                stn_id = '00056'
                x_scaler = x_scaler_GKP48
                y_scaler = y_scaler_GKP48
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'GKP_48_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'GKP_48_input_features_len')

            elif station == 'HND':
                stn_id = '00017'
                x_scaler = x_scaler_HND48
                y_scaler = y_scaler_HND48
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'HND_48_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'HND_48_input_features_len')

            elif station == 'CDH':
                stn_id = '00010'
                x_scaler = x_scaler_CDH48
                y_scaler = y_scaler_CDH48
                inputs_features = [x.replace(" ", '') for x in config.get(
                    'PREDICT', 'CDH_48_input_features').split(',')]
                inputs_len = config.getint('PREDICT', 'CDH_48_input_features_len')

        if name1 == 'None':
            name1 = ''
        

        # below line commented on 18-03-2023 Manish Kumar
        #df = fetchData2(station, name1, name2, values['large_hours_len'], stn_id)
        df = _df_COMP_IDEX4
        print(df.head(5))
        #print(df.shape)

        #df.to_csv("Original_DataFrame.csv", index="False")
        #############################################
        print(""" New Preprocessing module being used """)

        # clean_data = preprocessing(df)
        # df = clean_data.copy()
        # df = df.reset_index()

        #print(df.tail())
        pr = Clean_data()
        clean_data = pr.preprocess(df, values['large_hours_len'])

        clean_data_sampling = clean_data.copy()
        clean_data = clean_data.reset_index()
        #print(clean_data.tail())
        #print(clean_data.columns)
        print(clean_data.isna().sum())
        actuals_with_time = {clean_data['DATETIME'].iloc[i]: clean_data['VV'].iloc[i] for i in range(clean_data.shape[0])}
        #print("actuals_with_time : ", actuals_with_time)
        
        

        # below codes changed by manish for conversion of 6 values to 12 values proccess with shalini's code.
        # *************************************************************************************************************************
        try :
            
            sampled_data = pr.sampling(clean_data_sampling, values['fchr'])
            df = sampled_data.copy()
            df = df.tail(values['hours_len'])

            #print(df.head())
            #print(df.dtypes)
            #print(df.shape)
            #############################################

            model = "model_"+station+"_"+values['fchr']
            dfr = df[inputs_features]  # for getting last vsibility value
            inputs = df[inputs_features].values
            inputs = inputs.reshape(-1, inputs_len)
            inputs = x_scaler.transform(inputs)
            #print("Input shape", inputs.shape)
            inputt = np.reshape(inputs, (-1, values['hours_len'],  inputs_len))
            #inputt = inputs.reshape(1,values['hours_len'],  inputs_len)

            predicted_Visibility = all_models[model].predict(inputt)
            predicted_Visibility = y_scaler.inverse_transform(predicted_Visibility)

            results = predicted_Visibility.flatten()
            predictions = list(results)
            predictions = np.round(np.abs(predictions))

            print("Predictions = ", predictions)

            if values['fchr'] == "6hr":
                ind = dfr.shape[0]-1
                last_visibility = dfr['VV'].iloc[ind]
                result = predicted_Visibility.flatten()

                result_list = []
                result_list.append(last_visibility)
                result_list.extend(result)
                result_list = np.round(np.abs(result_list))

                print(result_list)
                range_date = pd.date_range(start='01:00:00', end='07:00:00', freq='H')
                cc = pd.DataFrame(index=range_date)
                cc['Prediction'] = result_list
                print(cc)
                cf = cc.resample('30min').asfreq()
                print(cf)
                cf.interpolate(method='time', inplace=True)
                predictions = cf['Prediction'].values[1:]
                predictions = np.round(np.abs(predictions))
                print("Predictions = ", predictions)

            

            predictions = np.nan_to_num(predictions, nan=1000)    
            print("Predictions = ",predictions)
            
        except:
            print('issue in prediction insert dummy prediction')

            if values['fchr'] == "6hr":
                predictions = np.array(
                    [2707., 2734., 2761., 2712., 2663., 2550., 2436., 2284., 2132., 2007., 1882., 1882.])

            elif values['fchr'] == "48hr":
                predictions = np.array([1707., 1609., 1696., 1992., 2488., 3111., 3513., 3695., 3785., 3813., 3719., 3550.,
                                        3363., 3146., 3119., 3320., 3707., 4204., 4423., 4509., 4482., 4436., 4298., 4177.])               

    
        # *******************************************************************************end******************************


        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        
        lastHour = _pcontinueFrmDate
        #print("lastHour : ______________________________________________", lastHour)
        st = pd.to_datetime(lastHour)
        st_copy = st

        datelist = []
        for i in range(values['fcValues']):
            st_copy = st_copy + pd.DateOffset(hours=values['fcInterval'])
            datelist.append(st_copy.strftime('%Y-%m-%d %H:%M:%S'))

        # Get actual value directly from COMP_IDEX
        _oraQuery = "SELECT count(VV*100) AS VV FROM COMP_IDEX4 WHERE INDEX_NO = "+stn_id+" AND VV IS NOT NULL AND "\
                    "TO_CHAR(TO_DATE((year || '-' || month || '-' || dd || ' ' || GGGG||'00'), "\
                    "'YYYY-MM-DD HH24MISS'),  'YYYY-MM-DD HH24:MI:SS') = '"+lastHour+"'"
        cursor.execute(_oraQuery)
        print('Getting the actual value ________________________________', _oraQuery)
        current_actual = cursor.fetchall()[0][0]
        print("current_actual  : ", current_actual)
        _oraQuery = ""
        if current_actual == 0:
            
            _oraQuery = 'select "'+str(values['recentPredColumn'])+'" from ' + str(station) + '_pae_' + \
                values['fchr']+' where datetime=to_timestamp(\''+str(
                    lastHour)+'\', \'YYYY-MM-DD HH24-MI-SS\')'
            print("_oraQuery : ", _oraQuery)
            cursor.execute(_oraQuery)
            current_actual = cursor.fetchall()[0][0]

            
            print('Setting the actual value same as Predicted value :', current_actual)
        else:
            _oraQuery = "SELECT (VV*100) AS VV FROM COMP_IDEX4 WHERE INDEX_NO = "+stn_id+" AND VV IS NOT NULL AND "\
                "TO_CHAR(TO_DATE((year || '-' || month || '-' || dd || ' ' || GGGG||'00'), "\
                "'YYYY-MM-DD HH24MISS'),  'YYYY-MM-DD HH24:MI:SS') = '"+lastHour+"'"
            print("_oraQuery : ", _oraQuery)
            cursor.execute(_oraQuery)
            current_actual = cursor.fetchall()[0][0]
            
            print('Setting the actual value from COMP_IDX4:', current_actual)

        print('GET CURRENT ACTUAL_______________________________', current_actual)
        current_actual = float(current_actual)

        '''
        if st in actuals_with_time.keys():
            current_actual = actuals_with_time[st]
        else:
            select = 'select "'+str(values['recentPredColumn'])+'" from ' + str(station) + '_pae_' + \
                values['fchr']+' where datetime=to_timestamp(\''+str(
                    lastHour)+'\', \'YYYY-MM-DD HH24-MI-SS\')'
            cursor.execute(select)
            current_actual = cursor.fetchall()[0][0]
        '''
        insert = 'update ' + str(station) + '_pae_'+values['fchr']+' set "actual(t)"= ' + str(
            current_actual)+' where datetime=to_timestamp(\''+str(lastHour)+'\', \'YYYY-MM-DD HH24-MI-SS\') '
        
        #print("Actual List :", actualList)
        #print("oracle Query :", insert)
        cursor.execute(insert)

        colList = []
        x = values['fcInterval']
        for i in range(values['fcValues']):
            colList.append(x)
            x += values['fcInterval']

        select = 'select * from ' + \
            str(station) + '_pae_'+values['fchr']+' where datetime=to_timestamp(\''+str(
                lastHour)+'\', \'YYYY-MM-DD HH24-MI-SS\') '
        cursor.execute(select)
        cur_row = list(cursor.fetchall()[0])
        k = values['lastPredReverseNo']
        t = 0

        while k >= 0:
            if current_actual == 0.0:
                current_actual = 0.00001
            error = round(
                float(abs(((current_actual-cur_row[k])/current_actual) * 100)), 2)
            col_name = '\"error(t-' + str(colList[t]) + ')\"'
            update = 'update ' + str(station) + '_pae_'+values['fchr']+' set ' + col_name+'= ' + str(
                error)+' where datetime=to_timestamp(\''+str(lastHour)+'\', \'YYYY-MM-DD HH24-MI-SS\')'
            cursor.execute(update)
            connection.commit()
            t += 1
            k -= 2

        for i in range(len(predictions)-1):
            col_name = '\"pred(t-' + str(colList[i]) + ')\"'
            update = 'update ' + str(station) + '_pae_'+values['fchr']+' set ' + col_name+'= ' + str(
                predictions[i])+' where datetime=to_timestamp(\''+str(datelist[i])+'\', \'YYYY-MM-DD HH24-MI-SS\')'
            cursor.execute(update)
            connection.commit()

        i += 1
        col_name = '\"pred(t-' + str(colList[i]) + ')\"'
        insert = 'insert into ' + str(station) + '_pae_'+values['fchr']+' (datetime,' + col_name+') values(to_timestamp(\''+str(
            datelist[-1])+'\', \'YYYY-MM-DD HH24-MI-SS\') ,' + str(predictions[-1]) + ' )'
        cursor.execute(insert)
        connection.commit()

    except Exception as ex:
        print("Error occured in function predict ", ex)
        print("Complete Error in function predict =  ",
              str(logging.traceback.format_exc()))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
# Function to insert Dummy records to Input table automatically
def put_timely_data():
    #print("Hello World...")
    files = [x.replace(" ", '')
             for x in config.get('timely_data', 'files').split(',')]
    # print(files[0])

    try:
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        q = 'select * from countdb'
        cursor.execute(q)
        c = cursor.fetchall()[0][0]
        # print(c)

        for i in range(len(files)):
            f = open('timely_insert/'+files[i])
            full_sql = f.read()
            sql_commands = full_sql.split(';')
            # print(sql_commands[c*2])
            cursor.execute(sql_commands[c*2])
            cursor.execute(sql_commands[(c*2)+1])

        c += 1
        update = 'update countdb set v='+str(c)
        cursor.execute(update)
        connection.commit()

    except Exception as ex:
        print("Error occured in function put_timely_data ", ex)
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function which runs for every timer cycle for getting predictions for Next 48 hours
def getPredictions48(_pcontinueFrmDate):
    
    try :
        global socketFlag
        all_predictions = {}

        now = datetime.now()
        today = str(now.year).zfill(4)+'-'+str(now.month).zfill(2)+'-'+str(now.day).zfill(2) + \
            ' '+str(now.hour).zfill(2)+':'+str(now.minute).zfill(2) + \
            ':'+str(now.second).zfill(2)
        today = datetime.strptime(today, '%Y-%m-%d %H:%M:%S')
        today = pd.Timestamp(now)
        today_timestamp = today.floor(freq='30T')
        today = today_timestamp.to_pydatetime()
        what_time_now = str(today.year).zfill(4)+'-'+str(today.month).zfill(2)+'-'+str(today.day).zfill(
            2)+' '+str(today.hour).zfill(2)+':'+str(today.minute).zfill(2)+':'+str(today.second).zfill(2)

        print(" Predictions at "+str(what_time_now)+" Started....")

        name_for_SNG_1 = config.get('getPredictions48', 'name_for_SNG_1')
        name_for_GKP_1 = config.get('getPredictions48', 'name_for_GKP_1')
        name_for_HND_1 = config.get('getPredictions48', 'name_for_HND_1')
        name_for_CDH_1 = config.get('getPredictions48', 'name_for_CDH_1')

        name_for_SNG_2 = config.get('getPredictions48', 'name_for_SNG_2')
        name_for_GKP_2 = config.get('getPredictions48', 'name_for_GKP_2')
        name_for_HND_2 = config.get('getPredictions48', 'name_for_HND_2')
        name_for_CDH_2 = config.get('getPredictions48', 'name_for_CDH_2')

        ################################################################################
        """ When loop start get latest data from database, once for all stations """
        _oraQuery = "> to_char((to_date('2023-01-20', 'YYYY-MM-DD HH24:MI:SS')) - "\
                    "INTERVAL '23' DAY, 'YYYY-MM-DD HH24:MI:SS') AND ( datetime ) <="\
                    "to_char((to_date('"+_pcontinueFrmDate+"'"", 'YYYY-MM-DD HH24: MI: SS') + "\
                    "INTERVAL '30' MINUTE), 'YYYY-MM-DD HH24: MI: SS')"
        df = getLatestRec_COMP_IDEX4(_oraQuery)
        ################################################################################

        all_predictions = {}
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ SNG - 48 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['SNG_48hr'] = predict(
            'SNG', name_for_SNG_1, _pcontinueFrmDate, values48, df[df["STN_NAME"] == 'SNG'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ SNG - 48 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ GKP - 48 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['GKP_48hr'] = predict(
            'GKP', name_for_GKP_1, _pcontinueFrmDate, values48, df[df["STN_NAME"] == 'GKP'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ GKP - 48 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ HND - 48 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['HND_48hr'] = predict(
            'HND', name_for_HND_1, _pcontinueFrmDate, values48, df[df["STN_NAME"] == 'HND'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ HND - 48 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CDH - 48 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['CDH_48hr'] = predict(
            'CDH', name_for_CDH_1, _pcontinueFrmDate, values48, df[df["STN_NAME"] == 'CDH'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CDH - 48 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        socketFlag = True
        ###################
        df = None
        ##################
    except Exception as ex:
        print("Error occured in function getPredictions48 ", ex)

# function which runs for every timer cycle for getting predictions for Next 6 hours
def getPredictions6(_pcontinueFrmDate):
    
    try :
        global socketFlag
        all_predictions = {}

        # Function to insert Dummy records to Input table automatically
        # Not required in Production Code
        #put_timely_data()

        now = datetime.now()
        today = str(now.year).zfill(4)+'-'+str(now.month).zfill(2)+'-'+str(now.day).zfill(2) + \
            ' '+str(now.hour).zfill(2)+':'+str(now.minute).zfill(2) + \
            ':'+str(now.second).zfill(2)
        today = datetime.strptime(today, '%Y-%m-%d %H:%M:%S')
        today = pd.Timestamp(now)
        today_timestamp = today.floor(freq='30T')
        today = today_timestamp.to_pydatetime()
        what_time_now = str(today.year).zfill(4)+'-'+str(today.month).zfill(2)+'-'+str(today.day).zfill(
            2)+' '+str(today.hour).zfill(2)+':'+str(today.minute).zfill(2)+':'+str(today.second).zfill(2)

        print(" Predictions at "+str(what_time_now)+" Started....")

        name_for_SNG_1 = config.get('getPredictions6', 'name_for_SNG_1')
        name_for_GKP_1 = config.get('getPredictions6', 'name_for_GKP_1')
        name_for_HND_1 = config.get('getPredictions6', 'name_for_HND_1')
        name_for_CDH_1 = config.get('getPredictions6', 'name_for_CDH_1')

        name_for_SNG_2 = config.get('getPredictions6', 'name_for_SNG_2')
        name_for_GKP_2 = config.get('getPredictions6', 'name_for_GKP_2')
        name_for_HND_2 = config.get('getPredictions6', 'name_for_HND_2')
        name_for_CDH_2 = config.get('getPredictions6', 'name_for_CDH_2')

        ################################################################################
        """ When loop start get latest data from database, once for all stations """
        #_oraQuery = "> TO_CHAR( SYSDATE - INTERVAL '23' DAY, 'YYYY-MM-DD HH24:MI:SS') "
        _oraQuery = "> to_char((TO_DATE('"+_pcontinueFrmDate+"', 'YYYY-MM-DD HH24:MI:SS') - INTERVAL '23' DAY), "\
                    "'YYYY-MM-DD HH24:MI:SS') and datetime < to_char((TO_DATE('"+_pcontinueFrmDate + \
            "', 'YYYY-MM-DD HH24:MI:SS') + INTERVAL '1' MINUTE), 'YYYY-MM-DD HH24:MI:SS')"

        #print(_oraQuery)
        
        df = getLatestRec_COMP_IDEX4(_oraQuery)
        #return
        #print("getLatestRec_COMP_IDEX4 :", df.head())
        #return;
        #df.to_csv("Original_DataFrame.csv", index="False")
        ################################################################################

        all_predictions = {}
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ SNG - 6 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['SNG_6hr'] = predict(
            'SNG', name_for_SNG_1, _pcontinueFrmDate, values6, df[df["STN_NAME"] == 'SNG'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ SNG - 6 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ GKP - 6 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['GKP_6hr'] = predict(
            'GKP', name_for_GKP_1, _pcontinueFrmDate, values6, df[df["STN_NAME"] == 'GKP'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ GKP - 6 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ HND - 6 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['HND_6hr'] = predict(
            'HND', name_for_HND_1, _pcontinueFrmDate, values6, df[df["STN_NAME"] == 'HND'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ HND - 6 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CDH - 6 hour prediction started $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        all_predictions['CDH_6hr'] = predict(
            'CDH', name_for_CDH_1, _pcontinueFrmDate, values6, df[df["STN_NAME"] == 'CDH'])
        print("\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CDH - 6 hour prediction ends $$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

        socketFlag = True

        ###################
        df = None
        ##################
    except Exception as ex:
        print("Error occured in function getPredictions6 ", ex)
    

# loading and start predicting for all the cities
def loadModels():
    print("*********************** Loading Models starts***********************")
    global all_models
    global x_scaler_GKP6
    global y_scaler_GKP6
    global x_scaler_SNG6
    global y_scaler_SNG6
    global x_scaler_CDH6
    global y_scaler_CDH6
    global x_scaler_HND6
    global y_scaler_HND6

    global x_scaler_GKP48
    global y_scaler_GKP48
    global x_scaler_SNG48
    global y_scaler_SNG48
    global x_scaler_CDH48
    global y_scaler_CDH48
    global x_scaler_HND48
    global y_scaler_HND48

    all_models = {}

    try :

        x_scaler_GKP6 = load(
            open(config.get('loadModels', 'GKP6_x_scaler_path'), 'rb'))
        y_scaler_GKP6 = load(
            open(config.get('loadModels', 'GKP6_y_scaler_path'), 'rb'))
        x_scaler_SNG6 = load(
            open(config.get('loadModels', 'SNG6_x_scaler_path'), 'rb'))
        y_scaler_SNG6 = load(
            open(config.get('loadModels', 'SNG6_y_scaler_path'), 'rb'))
        x_scaler_CDH6 = load(
            open(config.get('loadModels', 'CDH6_x_scaler_path'), 'rb'))
        y_scaler_CDH6 = load(
            open(config.get('loadModels', 'CDH6_y_scaler_path'), 'rb'))
        x_scaler_HND6 = load(
            open(config.get('loadModels', 'HND6_x_scaler_path'), 'rb'))
        y_scaler_HND6 = load(
            open(config.get('loadModels', 'HND6_y_scaler_path'), 'rb'))

        x_scaler_GKP48 = load(
            open(config.get('loadModels', 'GKP48_x_scaler_path'), 'rb'))
        y_scaler_GKP48 = load(
            open(config.get('loadModels', 'GKP48_y_scaler_path'), 'rb'))
        x_scaler_SNG48 = load(
            open(config.get('loadModels', 'SNG48_x_scaler_path'), 'rb'))
        y_scaler_SNG48 = load(
            open(config.get('loadModels', 'SNG48_y_scaler_path'), 'rb'))
        x_scaler_CDH48 = load(
            open(config.get('loadModels', 'CDH48_x_scaler_path'), 'rb'))
        y_scaler_CDH48 = load(
            open(config.get('loadModels', 'CDH48_y_scaler_path'), 'rb'))
        x_scaler_HND48 = load(
            open(config.get('loadModels', 'HND48_x_scaler_path'), 'rb'))
        y_scaler_HND48 = load(
            open(config.get('loadModels', 'HND48_y_scaler_path'), 'rb'))

        all_models['model_SNG_6hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'SNG6_path'), compile=False)
        all_models['model_GKP_6hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'GKP6_path'), compile=False)
        all_models['model_HND_6hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'HND6_path'), compile=False)
        all_models['model_CDH_6hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'CDH6_path'), compile=False)

        all_models['model_SNG_48hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'SNG48_path'), compile=False)
        all_models['model_GKP_48hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'GKP48_path'), compile=False)
        all_models['model_HND_48hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'HND48_path'), compile=False)
        all_models['model_CDH_48hr'] = tf.keras.models.load_model(
            config.get('loadModels', 'CDH48_path'), compile=False)
    except Exception as ex:
        print("Error occured in function loadModels ", ex)

    print(datetime.now(), " : All Models loaded successfully and ready to use")
    print("*********************** Loading Models ends***********************")


# Function to insert Dummy records to output tables automatically
def fillPAE(dt):
    dt = datetime.strptime(dt, '%Y-%m-%d %H:%M:%S')
    # l = ['GKP', 'SNG', 'HND', 'CDH', 'GKP_48', 'SNG_48', 'HND_48', 'CDH_48']
    l = [x.replace(" ", '') for x in config.get('MAIN', 'l').split(',')]
    
    try:
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        for x in range(len(l)):
            if '48' not in l[x]:
                t = 0.5
                s = 12
            else:
                t = 2
                s = 24

            dt_list = []
            new_dt = dt
            for i in range(s):
                new_dt_str = new_dt.strftime('%Y-%m-%d %H:%M:%S')
                dt_list.append(new_dt_str)
                new_dt = new_dt + pd.DateOffset(hours=t)

            with open("pae_dummy_insert/"+l[x]+".sql") as f:
                sqlFile = f.read()
            sqlCommands = sqlFile.split(';')
            connection.commit()

            for i in range(0, len(sqlCommands)-1):
                # Manish Kumar 23-03-2023
                #UPDATE FIRST ENTRY(ROW'S) actual(t) WITH -999
                h = str(sqlCommands[i])
                #print(hh)
                if(i < len(sqlCommands)-2):
                    h = sqlCommands[i].replace(
                    "working_time", "'"+str(dt_list[i])
                    +"'")
                #print("sqlCommands :", sqlCommands[i])
                #print(h)
                cursor.execute(h)
                connection.commit()   


    except Exception as ex:
        print("Error occured in function fillPAE ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function for sending initial (default selected city, forecast hour) values to frontend
def sendToFrontendhttp(stn, selectedDate, fchr, isPast):
    global p_data
    global socketFlag
    global values6
    global values48
    global initialHttpData

    try:

        if stn == "Gorakhpur":
            stn = 'GKP'           
        elif stn == "Srinagar":
            stn = 'SNG'
        elif stn == "Hindan":
            stn = 'HND'
        elif stn == "Chandigarh":
            stn = 'CDH'

        

        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        hoursOffset = 0 # Show records from last 6/24 hours
        if fchr == '6hr':
            values = values6
            hoursOffset = 6
            hoursOffset_RecentPAE = 3
        elif fchr == '48hr':
            values = values48
            hoursOffset = 24
            hoursOffset_RecentPAE = 12

        lh2_query = 'select max(datetime) from '+stn+'_pae_'+fchr
        cursor.execute(lh2_query)
        print("selectedDate : ", selectedDate)
        #print("lh2_query :", lh2_query)
        lh2 = cursor.fetchall()[0][0]
        th2 = lh2 - pd.DateOffset(hours=values['forecastHours'])

        th3 = th2 - pd.DateOffset(hours=hoursOffset)
        time_RecentPAE = th2 - pd.DateOffset(hours=hoursOffset_RecentPAE)

        getAllPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr + \
            ' where datetime<=to_timestamp(\''+str(th2) + \
            '\', \'YYYY-MM-DD HH24-MI-SS\') and datetime >= to_timestamp(\''+str(th3) + \
            '\', \'YYYY-MM-DD HH24-MI-SS\')  ORDER BY datetime DESC'
        
        print(getAllPAEvalues_query)
        '''
        
        print("fchr :", fchr)
        print("lh2 :", lh2)
        print("th2 :", th2)
        print("th3 :", th3)
        print("time_RecentPAE :", time_RecentPAE)
        '''
        cursor.execute(getAllPAEvalues_query)
        allPAEvalues = cursor.fetchall()
        #print("getAllPAEvalues_query", getAllPAEvalues_query)
        allHourPAEvalues = []
        allActualPAEvalues = []
        allPredPAEvalues = []
        allErrorPAEvalues = []

        HourPAEvalues = []
        ActualPAEvalues = []
        PredPAEvalues = []
        ErrPAEvalues1 = []
        ErrPAEvalues2 = []
        ErrPAEvalues3 = []
        ErrPAEvalues4 = []
        ErrPAEvalues5 = []
        ErrPAEvalues6 = []
        
        #print("len(allPAEvalues) : ", len(allPAEvalues))

        for i in range(len(allPAEvalues)):
            allHourPAEvalues.append(
                allPAEvalues[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            allActualPAEvalues.append(allPAEvalues[i][-1])
            allPredPAEvalues.append(allPAEvalues[i][-3])
            allErrorPAEvalues.append(allPAEvalues[i][-2])

        dictAllPAE = {'h_all': allHourPAEvalues, 'a_all': allActualPAEvalues,
                      'p_all': allPredPAEvalues, 'e_all': allErrorPAEvalues}
        print("allHourPAEvalues", allHourPAEvalues)

        getPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr+' where datetime>=to_timestamp(\''+str(
            time_RecentPAE)+'\', \'YYYY-MM-DD HH24-MI-SS\') and datetime<=to_timestamp(\''+str(lh2)+'\', \'YYYY-MM-DD HH24-MI-SS\') ORDER BY datetime ASC'
        cursor.execute(getPAEvalues_query)
        print("getPAEvalues_query :", getPAEvalues_query)
        PAEvalues = cursor.fetchall()
                
        currColumnIndx=3

        for i in range(len(PAEvalues)):
            HourPAEvalues.append(
                PAEvalues[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            ActualPAEvalues.append(PAEvalues[i][-1])

            if PAEvalues[i][-currColumnIndx] != None:
                PredPAEvalues.append(PAEvalues[i][-currColumnIndx])
            elif PAEvalues[i][-currColumnIndx] == None:
                currColumnIndx += 2
                PredPAEvalues.append(PAEvalues[i][-currColumnIndx])
            #PredPAEvalues.append(PAEvalues[i][-3])
            if fchr == '6hr':
                ErrPAEvalues1.append(PAEvalues[i][-4])
                ErrPAEvalues2.append(PAEvalues[i][-8])
                ErrPAEvalues3.append(PAEvalues[i][-12])
                ErrPAEvalues4.append(PAEvalues[i][-16])
                ErrPAEvalues5.append(PAEvalues[i][-20])
                ErrPAEvalues6.append(PAEvalues[i][-24])
            elif fchr == '48hr':
                ErrPAEvalues1.append(PAEvalues[i][-2])
                ErrPAEvalues2.append(PAEvalues[i][-12])
                ErrPAEvalues3.append(PAEvalues[i][-20])
                ErrPAEvalues4.append(PAEvalues[i][-30])
                ErrPAEvalues5.append(PAEvalues[i][-40])
                ErrPAEvalues6.append(PAEvalues[i][-48])

        dictPAE = {'h_all': HourPAEvalues, 'a_all': ActualPAEvalues, 'p_all': PredPAEvalues, 
                   'e1_all': ErrPAEvalues1, 'e2_all': ErrPAEvalues2,'e3_all': ErrPAEvalues3,
                   'e4_all': ErrPAEvalues4,'e5_all': ErrPAEvalues5,'e6_all': ErrPAEvalues6}
        print("PredPAEvalues :", PredPAEvalues)
        '''for i in range(values['fcValues']):
            temp = []
            temp.append(PAEvalues[i][0])
            k = 3
            while PAEvalues[i][-k] == None:
                k += 2
            temp.append(PAEvalues[i][-k])
            PAE.append(temp)

        hourPAEvalues = []
        predPAEvalues = []
        for i in range(len(PAE)):
            hourPAEvalues.append(PAE[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            predPAEvalues.append(PAE[i][-1])

        dictPAE = {'h': hourPAEvalues, 'p': predPAEvalues}
        '''
        if isPast == True:
            selectedDateFormatted = selectedDate[:10]
            selectedDateFormatted2 = datetime.strptime(
                selectedDateFormatted, '%Y-%m-%d').strftime('%d-%m-%y')

            getSelectedPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr + \
                ' where TRUNC(datetime) = to_timestamp(\''+str(selectedDateFormatted) + \
                '\', \'YYYY-MM-DD HH24-MI-SS\') ORDER BY datetime ASC'
            print(getSelectedPAEvalues_query)
            cursor.execute(getSelectedPAEvalues_query)
            selectedPAEvalues = cursor.fetchall()
            SelPAE = []
            for i in range(len(selectedPAEvalues)):
                temp = []
                temp.append(selectedPAEvalues[i][0])
                temp.append(selectedPAEvalues[i][-1])
                p = 3
                while selectedPAEvalues[i][-p] == None:
                    p += 2
                temp.append(selectedPAEvalues[i][-p])
                e = 2
                while selectedPAEvalues[i][-e] == None:
                    if values['totalPaeColumns']-e == 2:
                        break
                    e += 2
                temp.append(selectedPAEvalues[i][-e])
                SelPAE.append(temp)

            selectedHourPAEvalues = []
            selectedActualPAEvalues = []
            selectedPredPAEvalues = []
            selectedErrorPAEvalues = []

            for i in range(len(SelPAE)):
                selectedHourPAEvalues.append(
                    SelPAE[i][0].strftime('%Y-%m-%d %H:%M:%S'))
                selectedActualPAEvalues.append(SelPAE[i][1])
                selectedPredPAEvalues.append(SelPAE[i][2])
                selectedErrorPAEvalues.append(SelPAE[i][3])

            dictSelectedPAE = {'h_sel': selectedHourPAEvalues, 'a_sel': selectedActualPAEvalues,
                               'p_sel': selectedPredPAEvalues, 'e_sel': selectedErrorPAEvalues}

        th2_before = (th2 - pd.DateOffset(days=values['reduction']))
        th2_time = str(th2.hour)+str(th2.minute).zfill(2)

        th2_before_date = str(th2_before.year).zfill(
            4)+'-'+str(th2_before.month).zfill(2)+'-'+str(th2_before.day).zfill(2)
        th2_date = str(th2.year).zfill(4)+'-' + \
            str(th2.month).zfill(2)+'-'+str(th2.day).zfill(2)
        th2_time = str(th2.hour).zfill(2)+str(th2.minute).zfill(2)

        
        
        _oraQueryFilter = "BETWEEN TO_CHAR(TO_DATE('"+str(th2_before)+"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AND "\
            "TO_CHAR(TO_DATE('"+str(th2)+"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') "        
        
        df1 = getLatestRec_COMP_IDEX4(_oraQueryFilter)

        pr = Clean_data()
        clean_rtf = pr.preprocess(
            df1, values['large_hours_len'])  # 15-03-2023 Manish
        
        ##########################################################
        sql_colums = [x.replace(" ", '') for x in config.get(
            'FETCHDATA', 'sqlColumns').split(',')]

        df = clean_rtf[sql_colums]
        #print("sh - df shape = ", df.shape)
        ###########################################################
       
        rtf_display = clean_rtf.iloc[-1]
        #print("clean_rtf shape Ends ")
        #print("rtf_display : ", rtf_display.head())
        #print(rtf_display)

        RTF = [rtf_display[i] for i in [int(x) for x in config.get(
            'sendToFrontendhttp', 'RTF_indices').split(',')]]
        #print("clean_rtf shape Ends ")
        prmts = [x.replace(" ", '') for x in config.get(
            'sendToFrontendhttp', 'RTF_prmts').split(',')]
        #print("clean_rtf shape Ends1 ")

        D = dict.fromkeys(prmts)
        for i in range(len(prmts)):
            D[prmts[i]] = RTF[i]

        if isPast == False:
            dictSelectedPAE = {}

        for key, value in D.items():
            if type(value) == np.int32 or type(value) == np.int64:
                D[key] = int(value)

        print("isPast : ", isPast)
        print("D1", D, type(D))
        print("dictAllPAE", dictAllPAE, type(dictAllPAE))
        print("dictPAE", dictPAE, type(dictPAE))
        print("dictSelectedPAE", dictSelectedPAE, type(dictSelectedPAE))

        initialHttpData = json.dumps(
            {'lastPAEValues': dictAllPAE, 'recentPAE': dictPAE, 'RTF_Values': D, 'selectedPAE': dictSelectedPAE})

        return initialHttpData

    except Exception as ex:
        print("Error occured in function sendToFrontendhttp ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function for sending predicted values based on selected city, forecast hour values to frontend
def sendToFrontend(stn, selectedDate, fchr, isPast):

    global p_data
    global socketFlag
    global values6
    global values48

    try:
        #print()
        fe_t1 = time.time()

        if stn == "Gorakhpur":
            stn = 'GKP'
            stn_id = '00056'
            n1 = config.get('sendToFrontendhttp', 'n1_GKP')
            n2 = config.get('sendToFrontendhttp', 'n2_GKP')
        elif stn == "Srinagar":
            stn = 'SNG'
            stn_id = '00001'
            n1 = config.get('sendToFrontendhttp', 'n1_SNG')
            n2 = config.get('sendToFrontendhttp', 'n2_SNG')
        elif stn == "Hindan":
            stn = 'HND'
            stn_id = '00017'
            n1 = config.get('sendToFrontendhttp', 'n1_HND')
            n2 = config.get('sendToFrontendhttp', 'n2_HND')
        elif stn == "Chandigarh":
            stn = 'CDH'
            stn_id = '00010'
            n1 = config.get('sendToFrontendhttp', 'n1_CDH')
            n2 = config.get('sendToFrontendhttp', 'n2_CDH')

        if n1 == 'None':
            n1 = ''
        if n2 == 'None':
            n2 = ''

        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        if fchr == '6hr':
            values = values6
            hoursOffset = 6
            hoursOffset_RecentPAE = 3
        elif fchr == '48hr':
            values = values48
            hoursOffset = 24
            hoursOffset_RecentPAE = 12

        lh2_query = 'select max(datetime) from '+stn+'_pae_'+fchr
        cursor.execute(lh2_query)
        lh2 = cursor.fetchall()[0][0]
        th2 = lh2 - pd.DateOffset(hours=values['forecastHours'])

        th3 = th2 - pd.DateOffset(hours=hoursOffset)
        time_RecentPAE = th2 - pd.DateOffset(hours=hoursOffset_RecentPAE)

        getAllPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr + \
            ' where datetime<=to_timestamp(\''+str(th2) + \
            '\', \'YYYY-MM-DD HH24-MI-SS\') and datetime >= to_timestamp(\''+str(th3) + \
            '\', \'YYYY-MM-DD HH24-MI-SS\')  ORDER BY datetime DESC'
        
        print("getAllPAEvalues_query :", getAllPAEvalues_query)
        '''
        print(getAllPAEvalues_query)
        print("fchr :", fchr)
        print("lh2 :", lh2)
        print("th2 :", th2)
        print("th3 :", th3)
        print("time_RecentPAE :", time_RecentPAE)
        '''
        cursor.execute(getAllPAEvalues_query)
        allPAEvalues = cursor.fetchall()

        allHourPAEvalues = []
        allActualPAEvalues = []
        allPredPAEvalues = []
        allErrorPAEvalues = []        

        HourPAEvalues = []
        ActualPAEvalues = []
        PredPAEvalues = []
        ErrPAEvalues1 = []
        ErrPAEvalues2 = []
        ErrPAEvalues3 = []
        ErrPAEvalues4 = []
        ErrPAEvalues5 = []
        ErrPAEvalues6 = []

        for i in range(len(allPAEvalues)):
            allHourPAEvalues.append(
                allPAEvalues[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            allActualPAEvalues.append(allPAEvalues[i][-1])
            allPredPAEvalues.append(allPAEvalues[i][-3])
            allErrorPAEvalues.append(allPAEvalues[i][-2])

        dictAllPAE = {'h_all': allHourPAEvalues, 'a_all': allActualPAEvalues,
                      'p_all': allPredPAEvalues, 'e_all': allErrorPAEvalues}
        
        print("allHourPAEvalues", allHourPAEvalues)
        getPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr+' where datetime>=to_timestamp(\''+str(
            time_RecentPAE)+'\', \'YYYY-MM-DD HH24-MI-SS\') and datetime<=to_timestamp(\''+str(lh2)+'\', \'YYYY-MM-DD HH24-MI-SS\') ORDER BY datetime ASC'
        
        print("getPAEvalues_query :", getPAEvalues_query)
        cursor.execute(getPAEvalues_query)
        PAEvalues = cursor.fetchall()
        
        currColumnIndx = 3
                
        for i in range(len(PAEvalues)):
            HourPAEvalues.append(
                PAEvalues[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            ActualPAEvalues.append(PAEvalues[i][-1])

            if PAEvalues[i][-currColumnIndx] != None:
                PredPAEvalues.append(PAEvalues[i][-currColumnIndx])
            elif PAEvalues[i][-currColumnIndx] == None:
                currColumnIndx += 2
                PredPAEvalues.append(PAEvalues[i][-currColumnIndx])
            #PredPAEvalues.append(PAEvalues[i][-3])

            if fchr == '6hr':
                ErrPAEvalues1.append(PAEvalues[i][-4])
                ErrPAEvalues2.append(PAEvalues[i][-8])
                ErrPAEvalues3.append(PAEvalues[i][-12])
                ErrPAEvalues4.append(PAEvalues[i][-16])
                ErrPAEvalues5.append(PAEvalues[i][-20])
                ErrPAEvalues6.append(PAEvalues[i][-24])
            elif fchr == '48hr':
                ErrPAEvalues1.append(PAEvalues[i][-2])
                ErrPAEvalues2.append(PAEvalues[i][-12])
                ErrPAEvalues3.append(PAEvalues[i][-20])
                ErrPAEvalues4.append(PAEvalues[i][-30])
                ErrPAEvalues5.append(PAEvalues[i][-40])
                ErrPAEvalues6.append(PAEvalues[i][-48])

        dictPAE = {'h_all': HourPAEvalues, 'a_all': ActualPAEvalues, 'p_all': PredPAEvalues, 
                   'e1_all': ErrPAEvalues1, 'e2_all': ErrPAEvalues2,'e3_all': ErrPAEvalues3,
                   'e4_all': ErrPAEvalues4,'e5_all': ErrPAEvalues5,'e6_all': ErrPAEvalues6}
        print("PredPAEvalues :", PredPAEvalues)
        '''
        for i in range(values['fcValues']):
            temp = []
            temp.append(PAEvalues[i][0])
            k = 3
            while PAEvalues[i][-k] == None:
                k += 2
            temp.append(PAEvalues[i][-k])
            PAE.append(temp)

        hourPAEvalues = []
        predPAEvalues = []
        for i in range(len(PAE)):
            hourPAEvalues.append(PAE[i][0].strftime('%Y-%m-%d %H:%M:%S'))
            predPAEvalues.append(PAE[i][-1])

        dictPAE = {'h': hourPAEvalues, 'p': predPAEvalues}
        '''
        if isPast == True:
            selectedDateFormatted = selectedDate[:10]
            selectedDateFormatted2 = datetime.strptime(
                selectedDateFormatted, '%Y-%m-%d').strftime('%d-%m-%y')

            getSelectedPAEvalues_query = 'select * from ' + stn + '_PAE_'+fchr + \
                ' where TRUNC(datetime) = to_timestamp(\''+str(selectedDateFormatted) + \
                '\', \'YYYY-MM-DD HH24-MI-SS\') ORDER BY datetime ASC'
            # getSelectedPAEvalues_query= 'select * from ' + stn + '_PAE_'+fchr+' where TRUNC(datetime) =\''+str(selectedDateFormatted)+'\' ORDER BY datetime ASC'
            cursor.execute(getSelectedPAEvalues_query)
            selectedPAEvalues = cursor.fetchall()

            SelPAE = []
            for i in range(len(selectedPAEvalues)):
                temp = []
                temp.append(selectedPAEvalues[i][0])
                temp.append(selectedPAEvalues[i][-1])
                p = 3
                while selectedPAEvalues[i][-p] == None:
                    p += 2
                temp.append(selectedPAEvalues[i][-p])
                e = 2
                while selectedPAEvalues[i][-e] == None:
                    if values['totalPaeColumns']-e == 2:
                        break
                    e += 2
                temp.append(selectedPAEvalues[i][-e])
                SelPAE.append(temp)

            selectedHourPAEvalues = []
            selectedActualPAEvalues = []
            selectedPredPAEvalues = []
            selectedErrorPAEvalues = []

            for i in range(len(SelPAE)):
                selectedHourPAEvalues.append(
                    SelPAE[i][0].strftime('%Y-%m-%d %H:%M:%S'))
                selectedActualPAEvalues.append(SelPAE[i][1])
                selectedPredPAEvalues.append(SelPAE[i][2])
                selectedErrorPAEvalues.append(SelPAE[i][3])

            dictSelectedPAE = {'h_sel': selectedHourPAEvalues, 'a_sel': selectedActualPAEvalues,
                               'p_sel': selectedPredPAEvalues, 'e_sel': selectedErrorPAEvalues}

        th2_before = (th2 - pd.DateOffset(days=values['reduction']))
        th2_time = str(th2.hour)+str(th2.minute).zfill(2)

        #print("Manish th2_before :", th2_before)
        #print("Manish th2_time :", th2)

        th2_before_date = str(th2_before.year).zfill(
            4)+'-'+str(th2_before.month).zfill(2)+'-'+str(th2_before.day).zfill(2)
        th2_date = str(th2.year).zfill(4)+'-' + \
            str(th2.month).zfill(2)+'-'+str(th2.day).zfill(2)
        th2_time = str(th2.hour).zfill(2)+str(th2.minute).zfill(2)

       
       
        _oraQueryFilter = "BETWEEN TO_CHAR(TO_DATE('"+str(th2_before)+"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AND "\
            "TO_CHAR(TO_DATE('"+str(th2)+"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') "        
        df1 = getLatestRec_COMP_IDEX4(_oraQueryFilter)       
        

        pr = Clean_data()
        clean_rtf = pr.preprocess(df1, values['large_hours_len'])
        

        ##########################################################
        sql_colums = [x.replace(" ", '') for x in config.get(
            'FETCHDATA', 'sqlColumns').split(',')]
        df = clean_rtf[sql_colums]
        rtf_display = clean_rtf.iloc[-1]
        #print("sh - df shape = ", df.shape)
        ###########################################################

        RTF = [rtf_display[i] for i in [int(x) for x in config.get(
            'sendToFrontendhttp', 'RTF_indices').split(',')]]
        prmts = [x.replace(" ", '') for x in config.get(
            'sendToFrontendhttp', 'RTF_prmts').split(',')]

        D = dict.fromkeys(prmts)
        for i in range(len(prmts)):
            D[prmts[i]] = RTF[i]

        if isPast == False:
            dictSelectedPAE = {}

        for key, value in D.items():
            if type(value) == np.int32 or type(value) == np.int64:
                D[key] = int(value)
        print("D2", D, type(D))
        print("dictAllPAE", dictAllPAE, type(dictAllPAE))
        print("dictPAE", dictPAE, type(dictPAE))
        print("dictSelectedPAE", dictSelectedPAE, type(dictSelectedPAE))

        p_data = json.dumps({'lastPAEValues': dictAllPAE, 'recentPAE': dictPAE,
                            'RTF_Values': D, 'selectedPAE': dictSelectedPAE})
        fe_t2 = time.time()

    except Exception as ex:
        print("Error occured in function sendToFrontend ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function which fetches list of stations and forecast hours available in the db to display for selection
@app.route('/selectCity', methods=['GET'])
def selectCity():
    try:
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        print("Select City Manish__________________________________")

        cityQuery = 'select city_name from cities'
        cursor.execute(cityQuery)
        city_list = cursor.fetchall()
        citylist = [city_list[i][0] for i in range(len(city_list))]
        print("city list  = ", citylist)
        hourQuery = 'select forecast_hours from forecast'
        cursor.execute(hourQuery)
        hour_list = cursor.fetchall()
        hourlist = [hour_list[i][0] for i in range(len(hour_list))]
        print("hour list  = ", hourlist)
        cl = {"city_list": citylist, "hour_list": hourlist}
        return cl

    except Exception as ex:
        print("Error occured in function selectCity ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# fetching the list of users requested for login from the db
@app.route('/getUserRequests', methods=['GET'])
def getUserRequests():
    try:
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        loginQuery = "select * from login where Approval_status='pending'"
        cursor.execute(loginQuery)
        request_user_list = cursor.fetchall()
        request_userlist = [request_user_list[i]
                            for i in range(len(request_user_list))]
        request_users = {"request_userlist": request_userlist}

        return request_users

    except Exception as ex:
        print("Error occured in function getUserRequests ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# fetching the list of active users from the db
@app.route('/getUserActive', methods=['GET'])
def getUserActive():
    try:
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        active_Query = "select * from login where Approval_status='active'"
        cursor.execute(active_Query)
        active_user_list = cursor.fetchall()
        active_userlist = [active_user_list[i]
                           for i in range(len(active_user_list))]
        active_users = {"active_userlist": active_userlist}

        return active_users

    except Exception as ex:
        print("Error occured in function getUserActive ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# fetching the list of inactive users from the db
@app.route('/getUserInactive', methods=['GET'])
def getUserInactive():
    try:
        connection = cx_Oracle.connect(user=config.get('CONNECTION', db_user), password=config.get(
            'CONNECTION', db_password), dsn=dsn, encoding=config.get('CONNECTION', db_encoding))
        cursor = connection.cursor()
        inactive_Query = "select * from login where Approval_status='disabled'"
        cursor.execute(inactive_Query)
        inactive_user_list = cursor.fetchall()
        inactive_userlist = [inactive_user_list[i]
                             for i in range(len(inactive_user_list))]
        inactive_users = {"inactive_userlist": inactive_userlist}

        return inactive_users

    except Exception as ex:
        print("Error occured in function getUserInactive ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function for updating the columns of the login table in the db
@app.route('/updateUser', methods=['POST'])
def updateUser():
    try:
        status = False
        data = request.data
        condition_column = json.loads(data)["condition_column"]
        condition_value = json.loads(data)["condition_value"]
        updating_column = json.loads(data)["updating_column"]
        updating_value = json.loads(data)["updating_value"]
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        updateQuery = "update login set "+str(updating_column)+"=\'"+str(
            updating_value)+"\' where "+str(condition_column)+"=\'"+str(condition_value)+"\'"
        cursor.execute(updateQuery)
        connection.commit()

        status = True
        response = app.response_class(
            response=json.dumps(({"status": status})),
            status=200,
            mimetype='application/json'
        )
        return response

    except Exception as ex:
        print("Error occured in function updateUser ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# deleting the desired user from the login table in db
@app.route('/deleteUser', methods=['POST'])
def deleteUser():
    try:
        status = False
        data = request.data
        condition_column = json.loads(data)["condition_column"]
        condition_value = json.loads(data)["condition_value"]
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        deleteQuery = "delete from login where " + \
            str(condition_column)+"=\'"+str(condition_value)+"\'"
        cursor.execute(deleteQuery)
        connection.commit()
        cursor.close()
        connection.close()
        status = True
        response = app.response_class(
            response=json.dumps(({"status": status})),
            status=200,
            mimetype='application/json'
        )
        return response

    except Exception as ex:
        print("Error occured in function deleteUser ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# addition of newly registered user to db to be shown on management page for super admin
@app.route('/registerUser', methods=['POST'])
def registerUser():
    try:
        status = False
        data = request.data
        l = json.loads(data)["registerUserInfo"]
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        maxIDquery = "select max(id) from login"
        cursor.execute(maxIDquery)
        maxID = cursor.fetchall()[0][0]
        l[0] = " ".join(l[0][:19].split('T'))
        l[0] = datetime.strptime(
            l[0], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S')
        registerquery = "insert into login values(" + str(maxID+1)+",'" + str(l[0])+"','"+str(
            l[1])+"','" + str(l[2])+"','" + str(l[3])+"','" + str(l[4])+"','" + str(l[5])+"')"
        cursor.execute(registerquery)
        connection.commit()

        status = True
        response = app.response_class(
            response=json.dumps(({"status": status})),
            status=200,
            mimetype='application/json'
        )
        return response

    except Exception as ex:
        print("Error occured in function registerUser ", ex)
    finally:
        # print()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# function for sending initial defualt selected values
@app.route('/getInitialPredictions', methods=['GET'])
def getInitialPredictions():
    global stn_selected
    global date_selected
    global fchr_selected
    global isPast

    # print("getInitialPredictions__ ************************** \
    #       ************************************************************* \
    #       **************************************************************************************")
    # print("stn_selected : ", stn_selected)
    # print("date_selected : ", date_selected)
    # print("fchr_selected : ", fchr_selected)
    # print("isPast : ", isPast)

    initialhttpData = sendToFrontendhttp(
        stn_selected, date_selected, fchr_selected, isPast)
    return initialhttpData

# getting the selected station, forecast hour and timing of selection from frontend
@app.route('/inputs', methods=['POST'])
def inputs():
    global stn_selected
    global date_selected
    global fchr_selected
    global isPast
    data = request.data
    stn_selected = json.loads(data)["stname"]
    date_selected = json.loads(data)["dt"]
    fchr_selected = json.loads(data)["fchour"]
    isPast = json.loads(data)["isPast"]
    return {"status": True}

# web socket functionality
@sockets.route('/visibility_predicted_values')
def sendData(ws):
    global socketFlag
    global p_data
    #print("In sendData function")
    try:
        while (not ws.closed):
            #print("In while loop")
            
            if socketFlag == True:
                t0_ws = time.time()
                #print("In while loop")
                sendToFrontend(stn_selected, date_selected,
                               fchr_selected, isPast)
                print("In while loop")
                print("ws started ___________________________________")
                ws.send(p_data)
                print("p_data :", p_data)
                socketFlag = False
                t1_ws = time.time()
                print("ws over ___________________________________")
                # print("Time elapsed for ws: ", t1_ws-t0_ws) # CPU seconds elapsed (floating point)
            gevent.sleep(1)

        print("----------------------------- Socket closed -------------------------")
    except Exception as ex:
        print("Error occured in function sendData ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))

# Get Latest records from Input Table(COMP_IDEX4) of Database
def getLatestRec_COMP_IDEX4(_oraQueryFilter):
    originDF = None
    try:
        print("--------------------------- Fetching records from COMP_IDEX4 Starts ---------------------------")
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        #print("connection to the DB is successful")

        _oraQuery = "SELECT * FROM (SELECT to_char(TO_DATE((year || '-' || month || '-' || dd || ' ' || "\
                    "GGGG), 'YYYY-MM-DD HH24MISS'), 'YYYY-MM-DD HH24:MI:SS') AS datetime, "\
                    "year, month, index_no, ( "\
                    "CASE WHEN index_no = 1  THEN 'SNG' "\
                    "WHEN index_no = 10 THEN 'CDH' "\
                    "WHEN index_no = 17 THEN 'HND' ELSE 'GKP' END ) AS stn_name, "\
                    "dd, t, gggg, ddd, ff, fmfm, round(vv, 0) as VV, ww, n, cl1, cl2, cl3, cl4, "\
                    "cl5, cl6, (ttt/10) as TTT, twtw, (tdtd/10) as TDTD, rh, (qfe/10) as QFE, (qff/10) as QFF, qnh, txtx, rrr, tot_rrr "\
                    "FROM COMP_IDEX4 ) WHERE datetime "+_oraQueryFilter+ " "\
                    "ORDER BY datetime"

        #print("Oracle Query :", _oraQuery)
        #return;
        cursor.execute(_oraQuery)
        originDF = cursor.fetchall()
        originDF = pd.DataFrame.from_records(
            originDF, columns=[x[0] for x in cursor.description])

        cursor.close()
        connection.close()

        originDF = originDF.fillna(-999999)

        originDF['DATETIME'] = pd.to_datetime(
            originDF['DATETIME'], format='%Y-%m-%d %H:%M:%S')
        originDF['STN_NAME'] = originDF['STN_NAME'].astype('string')
        originDF['T'] = originDF['T'].astype(int)
        originDF['WW'] = originDF['WW'].astype(int)
        originDF['CL1'] = originDF['CL1'].astype(float)
        originDF['CL2'] = originDF['CL2'].astype(float)
        originDF['CL3'] = originDF['CL3'].astype(float)
        originDF['CL4'] = originDF['CL4'].astype(float)
        originDF['CL5'] = originDF['CL5'].astype(float)
        originDF['CL6'] = originDF['CL6'].astype(float)
        originDF['QNH'] = originDF['QNH'].astype(float)
        originDF['TOT_RRR'] = originDF['TOT_RRR'].astype(float)

        originDF['INDEX_NO'] = originDF['INDEX_NO'].astype(int)
        originDF['DDD'] = originDF['DDD'].astype(int)
        originDF['FF'] = originDF['FF'].astype(int)
        originDF['FMFM'] = originDF['FMFM'].astype(float)
        originDF['VV'] = originDF['VV'].astype(int)
        originDF['GGGG'] = originDF['GGGG'].astype(int)

        originDF['TTT'] = originDF['TTT'].astype(float)
        originDF['TDTD'] = originDF['TDTD'].astype(float)
        originDF['TWTW'] = originDF['TWTW'].astype(float)
        originDF['RH'] = originDF['RH'].astype(float)
        originDF['QFE'] = originDF['QFE'].astype(float)
        originDF['QFF'] = originDF['QFF'].astype(float)
        originDF['RRR'] = originDF['RRR'].astype(float)
        originDF['TXTX'] = originDF['TXTX'].astype(float)
        originDF['N'] = originDF['N'].astype(float)
        originDF = originDF.replace(-999999, np.nan)

        originDF = originDF.sort_values(
            by='DATETIME', ascending=True, na_position='first')
        #originDF.to_csv("Original_DataFrame.csv", index="False")

        print()
        #print(originDF.head(5))
        #print("DB Dataframe shape :", originDF.shape)

        print("--------------------------- Fetching records from COMP_IDEX4 Ends ---------------------------")

    except Exception as ex:
        print("Error occured in function getLatestRec_COMP_IDEX4 ", ex)
    finally:
        return originDF

# function to check whether prediction required or not
def check_ISPredictionProcessRequired(_lnRunCount, _tableName) :
    try :
        print("\n____________________________________________________________________________________________________\n")
        print(datetime.now(),": function check_ISPredictionProcessRequired starts here ---------------------------")
        
        _oraQuery = "SELECT  count(TO_CHAR( TO_DATE( (YEAR || '-' || MONTH || '-' || DD || ' ' || "\
                    "GGGG), 'YYYY-MM-DD HH24MISS'), "\
                    "'YYYY-MM-DD HH24:MI:SS')) AS DATETIME FROM COMP_IDEX4 WHERE "\
                    "TO_CHAR( TO_DATE( (YEAR || '-' || MONTH || '-' || DD || ' ' || "\
                    "GGGG), 'YYYY-MM-DD HH24MISS'), "\
                    "'YYYY-MM-DD HH24:MI:SS') "
        if(_lnRunCount):
            _oraQuery += " = (SELECT TO_CHAR(MAX(DATETIME),'YYYY-MM-DD HH24:MI:SS') AS DATETIME FROM "+_tableName+" WHERE \"actual(t)\" IS NOT NULL)"
        else :
            _oraQuery += " >= (SELECT TO_CHAR(MIN(DATETIME), 'YYYY-MM-DD HH24:MI:SS') AS DATETIME FROM "+_tableName+" WHERE \"actual(t)\" IS NULL "\
                "AND TO_CHAR(DATETIME, 'YYYY-MM-DD HH24:MI:SS') > (SELECT TO_CHAR(MAX(DATETIME), 'YYYY-MM-DD HH24:MI:SS') AS DATETIME "\
                    "FROM "+_tableName+" WHERE \"actual(t)\" IS NOT NULL))"
                    
        
        print(_oraQuery)
        
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()
        cursor.execute(_oraQuery)        

        _isPredictionProcessRequired = cursor.fetchall()[0][0]
       

        if(_isPredictionProcessRequired) :

            print("Weather Forecasting for upcoming Hours REQUIRED")
            if(_lnRunCount):
                _oraQuery = "SELECT TO_CHAR(MAX(DATETIME),'YYYY-MM-DD HH24:MI:SS') AS DATETIME FROM "+_tableName+" WHERE \"actual(t)\" IS NOT NULL"
            else :
                _oraQuery = "SELECT TO_CHAR(MIN(DATETIME), 'YYYY-MM-DD HH24:MI:SS') AS DATETIME FROM "+_tableName+" WHERE \"actual(t)\" IS NULL "\
                "AND TO_CHAR(DATETIME, 'YYYY-MM-DD HH24:MI:SS') > (SELECT TO_CHAR(MAX(DATETIME), 'YYYY-MM-DD HH24:MI:SS') AS DATETIME "\
                    "FROM "+_tableName+" WHERE \"actual(t)\" IS NOT NULL)"
            
            #_oraQuery = _oraQuery.replace("count", "min")
            #print(_oraQuery)
            cursor.execute(_oraQuery)
            _pcontinueFrmDate = cursor.fetchall()[0][0]

            
            
            print("_pcontinueFrmDate :", _pcontinueFrmDate)
            
            # getPredictions6(_pcontinueFrmDate)
            # getPredictions48(_pcontinueFrmDate)
            if _tableName.split('_')[2] == "6HR" :
                getPredictions6(_pcontinueFrmDate)
            else :
                getPredictions48(_pcontinueFrmDate)
        else :
            print(
                "Weather Forecasting for upcoming Hours : "+_tableName.split('_')[2]+"  NOT REQUIRED\n"\
                "initial table COMP_IDEX4 don't have updated records.")
    
    except Exception as ex:
        print("Error occured in function check_ISPredictionProcessRequired ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))
    finally:  
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        print(datetime.now(), ": function check_ISPredictionProcessRequired ends here - --------------------------")
        print("\n____________________________________________________________________________________________________\n")

# function to iterate in time interval output Tables
def _procVisibilityForecasting(_lnRunCount):
    try :
        _primaryTables = [x.replace(" ", '')
                          for x in config.get('primaryPAETables', 'tables').split(',')]
        
        for i in range(len(_primaryTables)):
            check_ISPredictionProcessRequired(_lnRunCount, _primaryTables[i])

    except Exception as ex :
        print("Error occured in function _procVisibilityForecasting ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))

# main function: code starts execution
if __name__ == "__main__":

    print()
    print("*********************** Visibility Forecasting Started ***********************")
    try:
        # calling function loadModels
        loadModels()  

        global values6
        global values48

        values6 = {}
        for keys in dict(config.items('values6')):
            v = config['values6'][keys].replace(' ', '')
            if whichData(v) == 'int':
                values6[keys] = int(v)
            elif whichData(v) == 'float':
                values6[keys] = float(v)
            if whichData(v) == 'string':
                values6[keys] = v

        values48 = {}
        for keys in dict(config.items('values48')):
            v = config['values48'][keys].replace(' ', '')
            if whichData(v) == 'int':
                values48[keys] = int(v)
            elif whichData(v) == 'float':
                values48[keys] = float(v)
            if whichData(v) == 'string':
                values48[keys] = v   

        """Region to insert Dummy records to the output Tables starts here """
        connection = cx_Oracle.connect(
            user=db_user, password=db_password, dsn=dsn, encoding=db_encoding)
        cursor = connection.cursor()

        # Get Latest Date from COMP_IDEX4
        cursor.execute("SELECT MAX(DATETIME) AS LATEST_INITIAL_REC FROM ( "\
                       "SELECT TO_CHAR( TO_DATE( (YEAR || '-' || MONTH || '-' || DD || ' ' || "\
                        "GGGG), 'YYYY-MM-DD HH24MISS'), 'YYYY-MM-DD HH24:MI:SS') AS DATETIME "
                        "FROM COMP_IDEX4)")
        lastest_actual_entry_date_time = cursor.fetchall()[0][0]

        cursor.execute("select count(*) from CDH_PAE_6HR")
        pae_rows = cursor.fetchall()[0][0]

        cursor.close()
        connection.close()

        if pae_rows == 0:
            #lastest_actual_entry_date_time = df_last['DATETIME'].iloc[0].strftime('%Y-%m-%d %H:%M:%S')
            fillPAE(lastest_actual_entry_date_time)

            # print("Insert Dummy records to the output Tables successfully completed")
            # """Region to insert Dummy records to the output Tables ends here """
            _procVisibilityForecasting(1)

        socketFlag = False     

        # print("&&&&&&&&&&&&&&&&&& SERVER STARTED &&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
        server = pywsgi.WSGIServer((config.get("WSGIServer", "IPDtls"), 5000), app, handler_class=WebSocketHandler)
        #server = pywsgi.WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
        #getPredictions6()
        #getPredictions48()

        #check_ISPredictionProcessRequired()

        #rt1 = RepeatedTimer(config.getint('MAIN', 'rt1_interval'), getPredictions6)
        #rt2 = RepeatedTimer(config.getint('MAIN', 'rt2_interval'), getPredictions48)
        rt3 = RepeatedTimer(config.getint(
            'MAIN', 'rt3_interval'), _procVisibilityForecasting, 0)
        
        server.serve_forever()

    except Exception as ex:
        print("Error occured in function main ", ex)
        print("Complete Error =  ", str(logging.traceback.format_exc()))
    finally:
        print("--------------------------- main function ends here ---------------------------")
