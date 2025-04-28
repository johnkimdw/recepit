# app/core/setup_oracle.py
import os
import cx_Oracle

# Set Oracle client library path if needed (only if running on a different machine)
# If running on the same machine as Oracle, this should be automatically detected
def setup_oracle_client():
    oracle_client_path = "/Users/lukecao/Downloads/instantclient_23_3"
    if os.path.exists(oracle_client_path):
        cx_Oracle.init_oracle_client(lib_dir=oracle_client_path)
    else:
        print("Oracle client library not found at expected path.")
        print("If running on a different machine than Oracle, install Oracle Instant Client.")