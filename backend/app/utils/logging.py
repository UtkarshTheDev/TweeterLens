import logging
import sys
from typing import Any, Dict, List

# Configure logging
def setup_logging() -> None:
    """Configure logging for the application"""
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "default",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "app": {"handlers": ["console"], "level": "INFO"},
            "uvicorn": {"handlers": ["console"], "level": "INFO"},
            "fastapi": {"handlers": ["console"], "level": "INFO"},
        },
    }
    
    logging.config.dictConfig(logging_config)
    
    return None 