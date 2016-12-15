package ledgerdb.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ResponseFormatter {

    private static final Logger logger = LoggerFactory.getLogger(ResponseFormatter.class);
    
    public static String format(ResultSet rs)
            throws IllegalArgumentException {
            //throws SQLException, JsonProcessingException {
            
        List<Map<String, Object>> rows = new ArrayList<>();
        
        try {
            ResultSetMetaData md = rs.getMetaData();
            int columnCount = md.getColumnCount();
            
            String[] columnNames = new String[columnCount];
            for (int i = 1; i <= columnCount; i++) {
                String s = md.getColumnName(i);
                columnNames[i - 1] = NameMapper.toLogicalName(s);
            }
            
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(columnNames[i - 1], rs.getObject(i));
                }
                rows.add(row);
            }
            logger.debug("Fetched " + rows.size() + " rows from result set");
        } catch (SQLException e) {
            throw new IllegalArgumentException(e);
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(rows);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e);
        }
    }
}
