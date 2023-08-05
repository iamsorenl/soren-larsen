import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const ProjectCard = () => {
    return (
        <Grid item xs={3}>
            <Paper elevation={3}>
                <img
                    src='https://thumbs.dreamstime.com/b/bleistift-und-papier-4029427.jpg'
                    alt=''
                    className='img'
                />
                <Box paddingX={1}>
                    <Typography variant='s2' component='h2'>
                        Project Number 1
                    </Typography>
                </Box>
            </Paper>
        </Grid>
    );
};

export default ProjectCard;