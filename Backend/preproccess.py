import pandas as pd
import numpy as np
import seaborn as sns 
import matplotlib.pyplot as plt
from datetime import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
#import seaborn as sns
from sklearn import metrics # for the evaluation
from sklearn.preprocessing import LabelEncoder,MinMaxScaler 
import tensorflow as tf
import pickle



class Clean_data:

    def __init__(self):
        pass
       
    def preprocess(self,df, v):

        try:
            
            

            """preprocessing function contains datatime column combination null value imputation and 
                feature extraction for all the city's data.

                df :      dataframe

                """
            
            if df['DATETIME'].dtypes == 'datetime64[ns]':
                print(f'DATETIME datatype is ok ')
            print(f'null value check for all main features')
            main_features = [ 'T', 'DDD', 'FF', 'VV',  'N', 'TTT','TWTW', 'TDTD', 'RH', 'QFE', 'QFF',  'TXTX' ]    
            for i in main_features:
                if df[i].isna().sum() == df.shape[0]:
                    print(f'This feature has all null values--------> {i} ')
                    df.loc[:, i] = df[i].fillna(4)
                    print(f'This feature null values filled')            
            
            
            #access datafrom as parameter
            print(f'1. access datafrom *****************************************************************')
            #dataframe
            print(f"size {df.shape}")
            # duplicated rows
            print(f"duplicate rows in dataset {df.duplicated().sum()}")
            #print(f"duplicate rows type {df[df.duplicated()].T.unique()}")

            #end result of this code is a new DataFrame with only the unique columns.
            df = df.loc[:, ~df.columns.duplicated()]

            #df.rename(columns={'DATE': 'OBV_DATE'}, inplace =True)
            dfc= df.copy()

            dfc.head()

            #check null values
            print(f'3. check null values*****************************************************************starts****************************************') 
            nul = pd.DataFrame(np.round((dfc.isna().sum()/dfc.shape[0])*100,3), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF', 'RRR']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            # print(f'percentage null values {n}')


            print(f'4 data cleaning step starts******************************************************************************')
            ## TYPE5

            #type5 elemination 
            #drop type5 entries
            print(f'4.1 drop type5 entries*******************************************************************************************************')                               
            dfc.drop(dfc[dfc['T']==5].index, inplace = True)
            # print(f'duplicated type5 entries dropped')

            #check null values
            nul = pd.DataFrame(np.round((dfc[['T', 'DDD', 'FF', 'FMFM','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF',  'RRR']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            ## DB
            print(f'4.2 DB interpolation******************************************************************************************************')
            # print(f'set datetime index')


            dfc.set_index('DATETIME', inplace=True)

            # FILLING MISSING VALUES 

            # print(f'null values in DB before imputation {dfc[(dfc.TT.isna())].shape}')
            dfc['TTT'].interpolate(method ='time', limit_direction ='both', inplace=True)
            # print(f'null values in DB after imputation {dfc[(dfc.TT.isna())].shape}')

            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF',  'RRR']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')
            ## DP,WB,RH,QFF,QFE,RRR

            #DP,WB,RH,QFF,QFE,RRR
            #after 2011  DP,QFF,QFE
            print(f'4.3 DP,WB,QFF,QFE,RRR interpolation************************************************************************************')

            # print(f'null imputation for DP,WB,RH,QFF,QFE,RRR starts')                                
            for i in ['TDTD','TWTW','QFF','QFE']:
                # print(f'null values in {i} before imputation {dfc[(dfc[i].isna())].shape}')
                dfc[i].interpolate(method ='time', limit_direction ='both', inplace=True)
                # print(f'null values in {i} after imputation {dfc[(dfc[i].isna())].shape}')


            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF',  'RRR']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            ## TXTX
            print(f'4.4 TXTX manupulation***********************************************************************************************')

            dfc['VV'] = dfc['VV'].fillna(method='ffill').fillna(method='bfill')
            dfc.loc[:, 'TXTX'] = dfc['TXTX'] / 10
            start_date1 = dfc.index[0]
            start_date_dt = pd.to_datetime(start_date1)
            start_date_1 = start_date_dt.strftime('%Y-%m-%d 00:00:00')
            start_date1_str = str(start_date1)

            print(f'start datetime start_date1 of dataset {start_date1_str}')
            start_date_2 = start_date1.strftime('%Y-%m-%d 23:59:00')
            start_date_2
            print(f'start datetime start_date2 of dataset {start_date_2}')


            end_date1 = dfc.index[dfc.shape[0]-1]
            end_date_1 = end_date1.strftime('%Y-%m-%d 00:00:00')
            print(f'end datetime end_date1 of dataset {end_date_1}')
            end_date2 = end_date1.strftime('%Y-%m-%d 23:59:00')
            print(f'end datetime end_date2 of dataset {end_date2}')
            end_date2

            # print(f'feature extraction from TXTX starts') 
            dfc['MIN'] = dfc['TXTX'].where(dfc['GGGG']==830, np.nan)
            dfc['MAX'] = dfc['TXTX'].where(dfc['GGGG']==1730, np.nan)


            rg1 = pd.date_range(start=start_date_1,end=end_date_1, freq='D')
            rg2 = pd.date_range(start=start_date_2,end=end_date2, freq='D')
            for i,j in zip(rg1,rg2):
                #print(i,j)
                k = dfc.loc[i:j]
                # k['MinTemp'].fillna(method="ffill", inplace=True)
                # k['MinTemp'].fillna(method="bfill", inplace=True)
                # k['MaxTemp'].fillna(method="ffill", inplace=True)
                # k['MaxTemp'].fillna(method="bfill", inplace=True)
                k['MIN'].fillna(method="ffill", inplace=True)
                k['MIN'].fillna(method="bfill", inplace=True)
                k['MAX'].fillna(method="ffill", inplace=True)
                k['MAX'].fillna(method="bfill", inplace=True)
            
            
            print('new features-----',dfc[['MIN','MAX','TXTX']].head(60))
            dfc.drop('TXTX', axis=1, inplace =True)
            print('new features-----',dfc[['MIN','MAX']].head(60))
            #dfc.drop('TXTX', axis=1, inplace =True)
            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF',  'RRR','MIN','MAX']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            print(f'4.5 FMFM manupulation***************************************************************************************************')

            # print(f'null imputation and binning for FMFM starts')

            # print(f'null values in FMFM before imputation {dfc[(dfc.FMFM.isna())].shape}')
            dfc['FMFM'] = dfc['FMFM'].where((dfc['FMFM'].notna()), 0)
            # print(f'null values in FMFM before imputation {dfc[(dfc.FMFM.isna())].shape}')


            bins = [-float('inf'), 11, 21, 33, 47, 63, float('inf')]
            labels = [0, 1, 2, 3, 4, 5]
            dfc['FMFM_bin'] = pd.cut(dfc['FMFM'], bins=bins, labels=labels, include_lowest=True)
            dfc['FMFM_bin'] = dfc.FMFM.astype('int64')
            val_ct =dfc['FMFM_bin'].value_counts()
            # print(f'FMFM_bin value counts {val_ct}')

            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','FMFM_bin','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF', 'RRR','MIN','MAX']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            #RRR manupulation
            print(f'4.6 RRR mnupulation*************************************************************************************************')
            # print(f'null imputation and binning for RRR starts')                                
            for i in ['RRR']:                                     
                if dfc[i].isna().sum() == dfc.shape[0]:
                    dfc[i] = dfc[i].fillna(0)
                else:  
                    # print(f'null values in {i} before imputation {dfc[(dfc[i].isna())].shape}')
                    dfc[i].fillna(method="ffill", inplace=True)
                    # print(f'null values in {i} after ffill imputation {dfc[(dfc[i].isna())].shape}')
                    dfc[i].fillna(method="bfill", inplace=True)
                    # print(f'null values in {i} after bfill imputation {dfc[(dfc[i].isna())].shape}')

            bins = [-float('inf'), 0.0, 2.4, 7.5, 35.5, 64.4,124.4,float('inf')]
            labels = [0, 1, 2, 3, 4, 5, 6]
            dfc['RRR_bin'] = pd.cut(dfc['RRR'], bins=bins, labels=labels, include_lowest=True)
            dfc['RRR_bin'] = dfc.FMFM.astype('int64')
            val_ct =dfc['RRR_bin'].value_counts()
            # print(f'RRR_bin value counts {val_ct}')

            #check null values
            nul = pd.DataFrame(np.round((dfc[['T',  'DDD', 'FF', 'FMFM','FMFM_bin','VV', 'N','TTT', 'TDTD', 'TWTW', 'RH', 'QFE', 'QFF', 'RRR','RRR_bin','MIN','MAX']].isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            #visibility scaling 
            print(f'4.8 visibility treatment********************************************************************************************')
            # print(f'conversion of visibility in meters starts')
            dfc['VV'] = dfc['VV']*100
            dfc.loc[dfc['VV'] == 9900, 'VV'] = 10000
            dfc.loc[dfc['VV'] == 0, 'VV'] = 50
            
            
            print(f' VV FF RH treatment********************************************************************************************')
            for i in ['VV', 'FF','RH']:
                print(f'null values in {i} before imputation {dfc[(dfc[i].isna())].shape}')
                dfc[i] = np.round(dfc[i].interpolate(method ='time', limit_direction ='both'))
                print(f'null values in {i} after imputation {dfc[(dfc[i].isna())].shape}')            

            
            
            #feature extraction 
            # print(f'4.7 feature extraction from FF and DDD wind vectors extraction*********************************************************')
            # print(f'feature extraction from FF and DDD starts and DDD imputation')    
            dfc.loc[dfc['DDD'] == 999, 'DDD'] = np.nan
            dfc['DDD'] = np.clip(np.round(dfc['DDD'].interpolate(method ='time', limit_direction ='both') / 10) * 10, 0, 360)

            #wind vector
            wv = dfc.FF
            max_wv = dfc.FF.max()

            # Convert to radians.
            wd_rad = dfc.DDD*np.pi / 180

            # Calculate the wind x and y components.
            dfc['Wx'] = wv*np.cos(wd_rad)
            dfc['Wy'] = wv*np.sin(wd_rad)

            # Calculate the max wind x and y components.
            dfc['Max_Wx'] = max_wv*np.cos(wd_rad)
            dfc['Max_Wy'] = max_wv*np.sin(wd_rad)
            # print(f'new features wind vectors and max wind vectors  components created Wx,Wy,Max_Wx,Max_Wy')  


            
            print(f' N T treatment********************************************************************************************')
            for i in ['N','T', 'MIN', 'MAX']:
                print(f'null values in {i} before imputation {dfc[(dfc[i].isna())].shape}')
                dfc[i].fillna(method="ffill", inplace=True)
                dfc[i].fillna(method="bfill", inplace=True)
                print(f'null values in {i} after imputation {dfc[(dfc[i].isna())].shape}')

            
            
            #check null values
            nul = pd.DataFrame(np.round((dfc.isna().sum()/dfc.shape[0])*100,5), columns=['null%'])
            n=nul.sort_values(by=['null%'])
            print(f'percentage null values {n}')

            #### data resampling script (null value imputation & feature extraction) #####

            # col =['STN_ID', 'YEAR', 'MONTH', 'DAY', 'RRR','FMFM','time','TIME','CL1', 'CL2', 'CL3', 'CL4', 'CL5', 'CL6']
            # dfc.drop(col, axis =1, inplace =True)
            #dfc = dfc[['DATE_TIME','INDEX_NO', 'OBV_DATE', 'GGGG', 'OBV_TYPE', 'DDD', 'FF', 'FMFM', 'TT', 'TWTW', 'RRR', 'RH', 'QFE', 'QFF', 'DP','MIN', 'MAX', 'N', 'VVVV', 'Wx','Wy', 'FMFM_bin', 'Max_Wx', 'Max_Wy', 'RRR_bin']]
            # print(f'5 deleting extra columns {col}')


            main_features = ['T',  'DDD', 'FF', 'FMFM', 'VV', 'N',  'TTT', 'TWTW', 'TDTD', 'RH', 'QFE', 'QFF', 'QNH', 'RRR',  'MIN', 'MAX', 'FMFM_bin', 'RRR_bin', 'Wx', 'Wy', 'Max_Wx', 'Max_Wy'] 
            for i in main_features:
                if dfc[i].isna().sum() == dfc.shape[0]:
                    print(f'This feature has all null values--------> {i} ')
                    dfc.loc[:, i] = dfc[i].fillna(4)
                    print(f'This feature null values filled')            
            
            
            
            
            
            ########################################################################################################3
            print(f'5. resampling started*********************************************************************************************')

            # print("before removing duplicaTES = \n", dfc.head(20))
            if dfc.reset_index().DATETIME.duplicated().sum()>0:
                #print(f'duplicate datatime entries present= {dfc.reset_index().DATETIME.duplicated().sum()}')
                dfc.reset_index(inplace =True)
                f = dfc[dfc['DATETIME'].duplicated()==True].index
                dfc.drop(f, inplace=True)
                print('duplicate datetime entries got droped')
                dfc.set_index('DATETIME', inplace=True) 
                #print("after removing duplicaTES = \n", dfc.head(20))

            else:
                print('no duplicate datatime entries present!')

            ###########################################################################################
            #dfc['VV'] = dfc['VV'].astype('int')

            # except Exception as e:
            #     print(f"error gonerated in the function preprocessing due to \n {e}")
            #     dfc = pd.DataFrame()

                


        except Exception as ex:
            print(f'error in preproccessing {ex}')
        
        
        
        return dfc
    
    



    def sampling(self, dfc, fhr):
            
        try:
            aa = dfc.copy()

            def fill_null(af):

                nl = af.isna().sum()
                print(f'total null values created due to resampling {nl}')

                print(f'5. null value imputation started**********************************************************************************')

                for i in ['TDTD','TWTW','RH','QFF','QFE','Wx', 'Wy','Max_Wx', 'Max_Wy','TTT','RRR','FMFM']:
                    print(f'null values in {i} before imputation {af[(af[i].isna())].shape}')
                    af[i].interpolate(method ='time', limit_direction ='both', inplace=True)
                    print(f'null values in {i} after imputation {af[(af[i].isna())].shape}')

                for i in ['FMFM_bin', 'RRR_bin','N','T', 'MAX','MIN']:
                    print(f'null values in {i} before imputation {af[(af[i].isna())].shape}')
                    af[i].fillna(method="ffill", inplace=True)
                    af[i].fillna(method="bfill", inplace=True)
                    print(f'null values in {i} after imputation {af[(af[i].isna())].shape}')


                # print(f'null values in DDD before imputation {af[(af.DDD.isna())].shape}')    
                af['DDD'] = np.clip(np.round(af['DDD'].interpolate(method ='time', limit_direction ='both') / 10) * 10, 0, 360)
                print(f'null values in DDD before imputation {af[(af.DDD.isna())].shape}')

                for i in ['VV', 'FF','RH']:
                    print(f'null values in {i} before imputation {af[(af[i].isna())].shape}')
                    af[i] = np.round(af[i].interpolate(method ='time', limit_direction ='both'))
                    print(f'null values in {i} after imputation {af[(af[i].isna())].shape}')


                nl = af.isna().sum()
                print(f'total null values after imputation {nl}')

                # af.drop(['YEAR', 'MONTH', 'INDEX_NO', 'STN_NAME', 'DD',  'GGGG', 
                #     'FMFM',  'WW',  'QNH', 'RRR', 'TOT_RRR',
                #     'MIN', 'MAX', 'FMFM_bin', 'RRR_bin', 'CL1', 'CL2', 'CL3', 'CL4', 'CL5', 'CL6'], axis = 1, inplace  = True)

                print(f'datatype chane of the variables***********************************************************************************')
                print(f'dtypes before conversion {af.dtypes}')
                cat =['DDD','FF','VV','N','T','FMFM_bin', 'RRR_bin','RH','FMFM' ]
                for i in cat:
                    af[i] = af[i].astype('int')
                num =['TTT', 'TDTD', 'TWTW', 'QFE', 'QFF', 'MIN', 'MAX', 'Wx', 'Wy','Max_Wx', 'Max_Wy', 'RRR']
                for i in num:
                    af[i] = af[i].astype('float')
                print(f'dtypes after conversion {af.dtypes}')

                return af  
            
            if fhr=='48hr':
                endd = aa.index[-1]
                print(f"end datetime of  preproccessed data---------------->{endd}")


                if endd.strftime('%M:%S') == '00:00':
                    print('00***************************************************************************00')
                    for i in range(aa.shape[0]):
                        if aa.index[i].strftime('%M:%S') == '00:00':
                            startt = aa.index[i]
                            break

                        else:
                            print('n')

                    endd = aa.index[-1]
                    print(f"start datetime of preproccessed data--------------->{startt}")
                    print(f"end datetime of  preproccessed data---------------->{endd}")

                    datetime_range = pd.date_range(start=startt, end=endd, freq='2H')
                    print(datetime_range)

                    af = aa.resample('30min').asfreq()
                    print(af.tail(2))
                    print(f"end datetime of  preproccessed data---------------->{af.index[-1]}")

                    aff = fill_null(af)
                    filtered_df = aff[aff.index.strftime('%M:%S') == '00:00']




                    # create a range of datetimes spaced 2 hours apart
                    start_date = filtered_df.index.min()
                    end_date = filtered_df.index.max()
                    interval_hours = 2
                    date_range = pd.date_range(start=start_date.ceil('H'), end=end_date.floor('H'), freq=f"{interval_hours}H")

                    # filter rows that fall within the date range
                    filtered_df_2h = filtered_df.loc[filtered_df.index.floor('H').isin(date_range)]

                    nl = filtered_df_2h.isna().sum()
                    print(f'total null values after imputation {nl}')


                    return filtered_df_2h


                elif endd.strftime('%M:%S') == '30:00':

                    print('30*************************************************************************************************30')
                    for i in range(aa.shape[0]):
                        if aa.index[i].strftime('%M:%S') == '30:00':
                            startt = aa.index[i]
                            break

                        else:
                            print('n')

                    endd = aa.index[-1]
                    print(f"start datetime of preproccessed data--------------->{startt}")
                    print(f"end datetime of  preproccessed data---------------->{endd}")

                    datetime_range = pd.date_range(start=startt, end=endd, freq='2H')
                    print(datetime_range)

                    af = aa.resample('30min').asfreq()
                    print(af.tail(2))
                    print(f"end datetime of  preproccessed data---------------->{af.index[-1]}")


                    aff = fill_null(af)         

                    filtered_df = aff[aff.index.strftime('%M:%S') == '30:00']


                    # create a range of datetimes spaced 2 hours apart
                    start_date = filtered_df.index.min()
                    end_date = filtered_df.index.max()
                    interval_hours = 2
                    date_range = pd.date_range(start=start_date.ceil('H'), end=end_date.floor('H'), freq=f"{interval_hours}H")

                    # filter rows that fall within the date range
                    filtered_df_2h = filtered_df.loc[filtered_df.index.floor('H').isin(date_range)]

                    nl = filtered_df_2h.isna().sum()
                    print(f'total null values after imputation {nl}')

                    return filtered_df_2h


                else:
                    
                    af = dfc.resample('2H').asfreq()
                    # print('successfuly 1H resampled')

                    aff = fill_null(af)

                    return aff                    


            elif fhr=='6hr':
                
                endd = aa.index[-1]
                print(f"end datetime of  preproccessed data---------------->{endd}")


                if endd.strftime('%M:%S') == '00:00':
                    print('00***************************************************************************00')
                    for i in range(aa.shape[0]):
                        if aa.index[i].strftime('%M:%S') == '00:00':
                            startt = aa.index[i]
                            break

                        else:
                            print('n')

                    endd = aa.index[-1]
                    print(f"start datetime of preproccessed data--------------->{startt}")
                    print(f"end datetime of  preproccessed data---------------->{endd}")

                    datetime_range = pd.date_range(start=startt, end=endd, freq='H')
                    print(datetime_range)

                    af = aa.resample('30min').asfreq()
                    print(af.tail(2))
                    print(f"end datetime of  preproccessed data---------------->{af.index[-1]}")

                    aff = fill_null(af)

                    filtered_df = aff[aff.index.strftime('%M:%S') == '00:00']

                    nl = filtered_df.isna().sum()
                    print(f'total null values after imputation {nl}')

                    return filtered_df


                elif endd.strftime('%M:%S') == '30:00':
                    print('30*************************************************************************************************30')
                    for i in range(aa.shape[0]):
                        if aa.index[i].strftime('%M:%S') == '30:00':
                            startt = aa.index[i]
                            break

                        else:
                            print('n')

                    endd = aa.index[-1]
                    print(f"start datetime of preproccessed data--------------->{startt}")
                    print(f"end datetime of  preproccessed data---------------->{endd}")

                    datetime_range = pd.date_range(start=startt, end=endd, freq='H')
                    print(datetime_range)

                    af = aa.resample('30min').asfreq()
                    print(af.tail(2))
                    print(f"end datetime of  preproccessed data---------------->{af.index[-1]}")


                    aff = fill_null(af)
                    filtered_df = aff[aff.index.strftime('%M:%S') == '30:00']

                    nl = filtered_df.isna().sum()
                    print(f'total null values after imputation {nl}')

                    return filtered_df

                else:
                    
                    af = dfc.resample('1H').asfreq()
                    # print('successfuly 1H resampled')

                    aff = fill_null(af)

                    return aff





                            

        except Exception as ex:

                    print(f'error in sampling {ex}')


        
