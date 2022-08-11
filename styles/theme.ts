import { colors } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
	overrides: {
		MuiInputBase: {
			input: {
				'&::placeholder': {
					opacity: 1,
					color: colors.blueGrey[600]
				}
			}
		},
	},
	palette: {
		type: 'light',
		action: {
			active: colors.blueGrey[600]
		},
		background: {
			default: colors.common.white,
			paper: colors.common.white
		},
		primary: {
			main: '#017AEF'
		},
		secondary: {
			main: '#5850EC'
		},
		text: {
			primary: colors.blueGrey[900],
			secondary: colors.blueGrey[600],
		}
	}
});
export { theme }